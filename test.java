@Component
public class QuestTimeZoneResolver {

    @Inject
    private CacheService cacheService;

    public ZoneId resolveZone() {

        // 1. Get base timezone (e.g., TZ_CENTRAL_TIME)
        StateInformation tzInfo = cacheService.getShortTitleAndZone("timeZone");
        String questTz = DateParserUtil.getQuestTimeZone(tzInfo.getAssignedValue());
        ZoneId baseZone = ZoneId.of(questTz);

        // 2. Get daylight observation flag (yes/no)
        StateInformation daylightInfo = cacheService.getShortTitleAndZone("daylight");
        boolean observeDst = !"no".equalsIgnoreCase(daylightInfo.getAssignedValue());

        // 3. If DST is NOT observed, force STANDARD offset
        if (!observeDst) {
            ZoneOffset standardOffset = baseZone.getRules().getStandardOffset(Instant.now());
            return standardOffset;
        }

        // 4. Otherwise use full IANA zone (DST auto-handled)
        return baseZone;
    }
}





@Component
public class CustomLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");

    @Inject
    private QuestTimeZoneResolver timeZoneResolver;

    @Override
    public LocalDateTime deserialize(JsonParser jp, DeserializationContext ctxt)
            throws IOException {

        JsonToken token = jp.getCurrentToken();
        ZoneId stateZone = timeZoneResolver.resolveZone();

        // 1. Epoch milliseconds
        if (token == JsonToken.VALUE_NUMBER_INT) {
            long epochMillis = jp.getLongValue();
            return Instant.ofEpochMilli(epochMillis)
                    .atZone(ZoneId.of("UTC"))
                    .toLocalDateTime();
        }

        // 2. String timestamp
        if (token == JsonToken.VALUE_STRING) {
            String text = jp.getText().trim();

            ZonedDateTime stateZdt = LocalDateTime.parse(text, FORMATTER)
                    .atZone(stateZone);

            return stateZdt.withZoneSameInstant(ZoneId.of("UTC")).toLocalDateTime();
        }

        throw new IOException("Unsupported date format: " + jp.getText());
    }
}




@Component
public class CustomLocalDateTimeSerializer extends JsonSerializer<LocalDateTime> {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");

    @Inject
    private QuestTimeZoneResolver timeZoneResolver;

    @Override
    public void serialize(LocalDateTime value, JsonGenerator gen, SerializerProvider serializers)
            throws IOException {

        ZoneId stateZone = timeZoneResolver.resolveZone();

        ZonedDateTime utc = value.atZone(ZoneId.of("UTC"));
        ZonedDateTime stateZdt = utc.withZoneSameInstant(stateZone);

        gen.writeString(stateZdt.format(FORMATTER));
    }
}
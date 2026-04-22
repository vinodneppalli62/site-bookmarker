@HostListener('paste', ['$event'])
onPaste(event: ClipboardEvent) {
  const input = event.target as HTMLInputElement;
  const max = Number(input.getAttribute('maxlength'));

  const pasted = event.clipboardData?.getData('text') || '';

  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;

  const newValue =
    input.value.substring(0, start) +
    pasted +
    input.value.substring(end);

  // ❌ If new value exceeds maxlength → block paste entirely
  if (!isNaN(max) && newValue.length > max) {
    event.preventDefault();
    return;
  }

  // ✅ Otherwise allow paste but manually apply it
  event.preventDefault();
  input.value = newValue;

  if (this.ngModel) {
    this.ngModel.control.setValue(newValue);
    this.ngModel.control.markAsTouched();
  }

  if (this.formControlName) {
    this.formControlName.control.setValue(newValue);
    this.formControlName.control.markAsTouched();
    this.formControlName.control.markAsDirty();
  }
}
import { Directive, HostListener, Optional } from '@angular/core';
import { NgModel, FormControlName } from '@angular/forms';
import { DataShareService } from './data-share.service';
import { Constants } from './constants';
import { CommonValidationService } from './common-validation.service';

@Directive({
  selector: '[appInvalidCharValidator]'
})
export class InvalidCharValidatorDirective {

  regexPattern!: RegExp;

  constructor(
    @Optional() private ngModel: NgModel,
    @Optional() private formControlName: FormControlName,
    private dataShareService: DataShareService,
    private constants: Constants,
    private commonValidationService: CommonValidationService
  ) {
    this.regexPattern = new RegExp(this.constants.getConstantValue('invalidCharRegex'));
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {

    let pastedData = event.clipboardData?.getData('text') || '';

    var windowsLineEndingRegExp = new RegExp("\r\n");
    var windowsLineEndingRegExpEnd = new RegExp("(\r\n)*\r\n$");

    if (windowsLineEndingRegExp.test(pastedData)) {
      pastedData = pastedData.replace(windowsLineEndingRegExpEnd, "");
      pastedData = pastedData.replace(windowsLineEndingRegExp, " ");
    }

    const invalidChars = [...pastedData].filter(char => !this.regexPattern.test(char));

    event.preventDefault();

    if (invalidChars.length > 0) {
      this.dataShareService.invokeAccountHeaderShowAlert({
        severity: 'warn',
        detail: 'Invalid character found, cannot paste.'
      });
    } else {

      // ---------------------------------------------------
      // NEW: MAXLENGTH ENFORCEMENT (added exactly here)
      // ---------------------------------------------------
      const target = event.target as HTMLInputElement;
      const max = parseInt(target.getAttribute('maxlength') || '', 10);

      if (!isNaN(max)) {
        pastedData = pastedData.substring(0, max);
      }

      pastedData = this.commonValidationService.replaceExtendedAsciiValues(pastedData);

      const start = target.selectionStart || 0;
      const end = target.selectionEnd || 0;

      const newValue =
        target.value.substring(0, start) +
        pastedData +
        target.value.substring(end);

      target.value = newValue;

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
  }
}
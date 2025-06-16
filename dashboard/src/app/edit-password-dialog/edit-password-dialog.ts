import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-edit-password-dialog',
  imports: [
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatDialogActions,
    MatButton,
    MatFormField,
    FormsModule,
    MatDialogContent,
    MatLabel
  ],
  templateUrl: './edit-password-dialog.html',
  styleUrl: './edit-password-dialog.scss'
})
export class EditPasswordDialog {
  constructor(
    public dialogRef: MatDialogRef<EditPasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number, label: string, value: string }
  ) {}

  save() {
    this.dialogRef.close(this.data);
  }
}

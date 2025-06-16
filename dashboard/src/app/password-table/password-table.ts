import { Component } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {EditPasswordDialog} from '../edit-password-dialog/edit-password-dialog';
import {MatCard} from '@angular/material/card';
import {
  MatCell, MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {PasswordService} from "../password-service";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-password-table',
  imports: [
    MatCard,
    MatTable,
    MatHeaderCell,
    MatCell,
    MatIconButton,
    MatColumnDef,
    MatRow,
    MatRowDef,
    MatHeaderCellDef,
    MatCellDef,
    MatIcon,
  ],
  templateUrl: './password-table.html',
  styleUrl: './password-table.scss'
})
export class PasswordTable {

  passwords: any[] = [
    { id: 1, domain: 'example.com', value: 'password123', show: false },
    { id: 2, domain: 'test.com', value: 'testpass456', show: false },
    { id: 3, domain: 'demo.com', value: 'demopass789', show: false }
  ];

  constructor(private dialog: MatDialog ,private passwordService: PasswordService) {}

  ngOnInit() {
    this.passwordService.getPasswordsByDomain('example.com').subscribe({
      next: res => this.passwords = res.data,
      error: err => console.error('Error loading passwords', err)
    });
  }


  togglePasswordVisibility(item: any) {
    item.show = !item.show;
  }

  deletePassword(id: number) {
    this.passwords = this.passwords.filter(p => p.id !== id);
  }

  editPassword(item: any) {
    const dialogRef = this.dialog.open(EditPasswordDialog, {
      data: { ...item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.passwords.findIndex(p => p.id === item.id);
        if (index > -1) {
          this.passwords[index] = result;
        }
      }
    });
  }
}

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPasswordDialog } from './edit-password-dialog';

describe('EditPasswordDialog', () => {
  let component: EditPasswordDialog;
  let fixture: ComponentFixture<EditPasswordDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPasswordDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPasswordDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

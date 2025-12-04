import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EventosService } from '../../services/eventos.service';
@Component({
  selector: 'app-editar-evento-modal',
  templateUrl: './editar-evento-modal.component.html',
  styleUrls: ['./editar-evento-modal.component.scss']
})
export class EditarEventoModalComponent  implements OnInit {
    public rol : string = "";

  constructor(
    private eventosService: EventosService,
    private dialogRef: MatDialogRef<EditarEventoModalComponent>,
    @Inject (MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.rol = this.data.rol;
  }

  cerrar_modal() {
    this.dialogRef.close({confirmado: false});
  }

  confirmarEdicion() {
    this.dialogRef.close({confirmado: true});
  }
}

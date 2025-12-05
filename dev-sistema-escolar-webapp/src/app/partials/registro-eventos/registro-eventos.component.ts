import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { EventosService } from 'src/app/services/eventos.service';
import { AdministradoresService } from 'src/app/services/administradores.service';
import { MaestrosService } from 'src/app/services/maestros.service';
import { EditarEventoModalComponent } from 'src/app/modals/editar-evento-modal/editar-evento-modal.component';
import { MatDialog } from '@angular/material/dialog';



@Component({
  selector: 'app-registro-eventos',
  templateUrl: './registro-eventos.component.html',
  styleUrls: ['./registro-eventos.component.scss']
})
export class RegistroEventosComponent implements OnInit {
  @Input() datos_evento: any = {};

  public evento: any = {};
  public token: string = "";
  public errors: any = {};
  public editar: boolean = false;
  public idEvento: any = 0;

  //lista para obtener los responsables
  public responsables: any[] = [];

   //Para el select
  public programas: any[] = [
    {value: '1', viewValue: 'Ingeniería en Ciencias de la Computación '},
    {value: '2', viewValue: 'Licenciatura en Ciencias de la Computación '},
    {value: '3', viewValue: 'Ingeniería en Tecnologías de la Información'},
  ];

constructor(
   private location: Location,
    public activatedRoute: ActivatedRoute,
    private eventosService: EventosService,
    private facadeService: FacadeService,
    private router: Router,
    private administradoresService: AdministradoresService,
    private maestrosService: MaestrosService,
    private dialog: MatDialog
) { }

ngOnInit(): void {
    this.evento = this.eventosService.esquemaEvento();

    //reponsables
    this.obtenerResponsables();

    console.log("Datos evento: ", this.evento);

    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.editar = true;
      this.idEvento = this.activatedRoute.snapshot.params['id'];
      console.log("ID Evento: ", this.idEvento);

     //Cargar los datos del evento desde el servicio
      this.eventosService.obtenerEventoPorID(this.idEvento).subscribe(
        (response) => {
          this.evento = response;

          //CONVERTIR HORAS DE 24h A 12h PARA EL TIMEPICKER
          if (this.evento.hora_inicio) {
            this.evento.hora_inicio = this.convertTo12h(this.evento.hora_inicio);
          }
          if (this.evento.hora_final) {
            this.evento.hora_final = this.convertTo12h(this.evento.hora_final);
          }

          console.log("Evento cargado para editar: ", this.evento);
        },
        (error) => {
          console.error("Error al obtener evento: ", error);
          alert("No se pudo cargar el evento");
          this.router.navigate(["/eventos"]);
        }
      );
    } else {
      // Va a registrar un nuevo evento
      this.evento = this.eventosService.esquemaEvento();
      this.token = this.facadeService.getSessionToken();
    }
    // Imprimir datos en consola
    console.log("Evento: ", this.evento);
  }

  // Método para obtener administradores y maestros
  public obtenerResponsables() {
    // Obtener administradores
    this.administradoresService.obtenerListaAdmins().subscribe(
      (admins) => {
        console.log("Administradores: ", admins);
        this.responsables = [...admins];

        // Obtener maestros y combinarlos
        this.maestrosService.obtenerListaMaestros().subscribe(
          (maestros) => {
            console.log("Maestros: ", maestros);
            this.responsables = [...this.responsables, ...maestros];
            console.log("Responsables combinados: ", this.responsables);
          },
          (error) => {
            console.error("Error al obtener maestros: ", error);
            alert("No se pudo obtener la lista de maestros");
          }
        );
      },
      (error) => {
        console.error("Error al obtener administradores: ", error);
        alert("No se pudo obtener la lista de administradores");
      }
    );
  }

  public regresar() {
    this.location.back();
  }

  public registrar() {
    // Validamos si el formulario está lleno y correcto
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }
    // Convertir al formato correcto
  this.evento.hora_inicio = this.convertTo24h(this.evento.hora_inicio);
  this.evento.hora_final = this.convertTo24h(this.evento.hora_final);

    // Lógica para registrar un nuevo evento
    this.eventosService.registrarEvento(this.evento).subscribe(
      (response) => {
        // Redirigir o mostrar mensaje de éxito
        alert("Evento registrado exitosamente");
        console.log("Evento registrado: ", response);
        this.router.navigate(["eventos"]);
      },
      (error) => {
        // Manejar errores de la API
        alert("Error al registrar evento");
        console.error("Error al registrar evento: ", error);
      }
    );
  }

  public actualizar() {
    // Validación de los datos
    this.errors = {};
    this.errors = this.eventosService.validarEvento(this.evento);
    if (Object.keys(this.errors).length > 0) {
      return false;
    }

    console.log("Datos ANTES de convertir:", this.evento);

    //Preparar datos para enviar
    const eventoActualizado = {
      ...this.evento,
      id: this.idEvento,
      // Convertir horas a formato 24h antes de enviar
      hora_inicio: this.convertTo24h(this.evento.hora_inicio),
      hora_final: this.convertTo24h(this.evento.hora_final)
    };

    console.log("Datos DESPUÉS de convertir:", eventoActualizado);

    // Ejecutar el servicio de actualización
    this.eventosService.actualizarEvento(eventoActualizado).subscribe(
      (response) => {
        alert("Evento actualizado exitosamente");
        console.log("Evento actualizado: ", response);
        this.router.navigate(["eventos"]);
      },
      (error) => {
        alert("Error al actualizar evento");
        console.error("Error al actualizar evento: ", error);
        if (error.error) {
          console.error("Detalles del error:", error.error);
        }
      }
    );
  }


  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    console.log(event);
    console.log(event.value.toISOString());

    this.evento.fecha_realizacion = event.value.toISOString().split("T")[0];
    console.log("Fecha: ", this.evento.fecha_realizacion);
  }

  //auxiliares
  convertTo24h(time: string) {
  const [hora, minuto] = time.split(':');
  let [min, periodo] = minuto.split(' ');

  let h = parseInt(hora);

  if (periodo === 'PM' && h !== 12) h += 12;
  if (periodo === 'AM' && h === 12) h = 0;

  return `${h.toString().padStart(2, '0')}:${min}`;
}

// Convierte de formato 24h (13:00:00 o 13:00) a formato 12h (1:00 PM)
convertTo12h(time: string): string {
  // Remover segundos si existen
  const timeParts = time.split(':');
  let hours = parseInt(timeParts[0]);
  const minutes = timeParts[1];

  const period = hours >= 12 ? 'PM' : 'AM';

  // Convertir a formato 12 horas
  if (hours === 0) {
    hours = 12; // Medianoche
  } else if (hours > 12) {
    hours = hours - 12;
  }

  return `${hours}:${minutes} ${period}`;
}
 //abrir modal
 public abrirModalConfirmacion() {
  const dialogRef = this.dialog.open(EditarEventoModalComponent, {
    height: '288px',
    width: '328px',
    data: {
      evento: this.evento
    }
  });

  dialogRef.afterClosed().subscribe(res => {
    console.log("Resultado del modal:", res);

    if (res?.confirmado) {
      this.actualizar();
    }
  });
}


}

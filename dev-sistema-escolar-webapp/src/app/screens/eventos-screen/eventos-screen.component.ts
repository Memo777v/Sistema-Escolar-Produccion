
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { EventosService } from 'src/app/services/eventos.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-eventos-screen',
  templateUrl: './eventos-screen.component.html',
  styleUrls: ['./eventos-screen.component.scss']
})
export class EventosScreenComponent implements OnInit, AfterViewInit {

  public name_user: string = "";
  public rol: string = "";
  public token: string = "";

  public lista_eventos: any[] = [];

  displayedColumns: string[] = [ 'nombre_evento','tipo_evento','fecha_realizacion','horas','lugar','publico_objetivo','cupo_maximo'];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(
    public facadeService: FacadeService,
    public eventosService: EventosService,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();

    if (this.token === "") {
      this.router.navigate(["/"]);
    }

    // Si es administrador agregamos columnas de acciones
    if (this.rol === "administrador") {
      this.displayedColumns.push("editar", "eliminar");
    }

    this.obtenerEventos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Ordenamiento personalizado
    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
      if (sortHeaderId === 'horas') {
        return `${data.hora_inicio} ${data.hora_fin}`;
      }
      return typeof data[sortHeaderId] === "string"
        ? data[sortHeaderId].toLowerCase()
        : data[sortHeaderId];
    };

  }

  public applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

 public obtenerEventos() {
  this.eventosService.obtenerListaEventos().subscribe(
    (response) => {let eventos = response;
      //filtro
      if (this.rol === 'alumno') {
        eventos = eventos.filter((evt: any) =>
          evt.publico_objetivo === 'general' || evt.publico_objetivo === 'alumnos'
        );
      }

      if (this.rol === 'maestro') {
        eventos = eventos.filter((evt: any) =>
          evt.publico_objetivo === 'general' || evt.publico_objetivo === 'maestros'
        );
      }

      this.lista_eventos = eventos;
      console.log("Eventos filtrados:", eventos);
      this.dataSource = new MatTableDataSource<any>(this.lista_eventos);
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });

    },
    (error) => {
      console.error("Error al obtener eventos: ", error);
      alert("No se pudo obtener la lista de eventos.");
    }
  );
}


  public goEditar(idEvento: number) {
    this.router.navigate(["/registro-eventos", idEvento]);
  }

  public delete(idEvento: number) {
    if (this.rol !== 'administrador') {
      alert("No tienes permisos para eliminar eventos.");
      return;
    }

    const dialogRef = this.dialog.open(EliminarUserModalComponent, {
      data: { id: idEvento, rol: 'evento' },
      height: '288px',
      width: '328px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.isDelete) {
        alert("Evento eliminado correctamente");
        window.location.reload();
      } else {
        console.log("No se eliminó el evento");
      }
    });
  }
}

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { AlumnosService } from 'src/app/services/alumnos.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarUserModalComponent } from 'src/app/modals/eliminar-user-modal/eliminar-user-modal.component';

@Component({
  selector: 'app-alumnos-screen',
  templateUrl: './alumnos-screen.component.html',
  styleUrls: ['./alumnos-screen.component.scss']
})
export class AlumnosScreenComponent implements OnInit, AfterViewInit {
  public name_user: string = "";
  public rol: string = "" ;
  public token: string = "";
  public lista_alumnos: any[] = [];

  displayedColumns: string[] = ['matricula', 'nombre', 'email', 'fecha_nacimiento', 'telefono', 'rfc', 'curp'];
  dataSource = new MatTableDataSource<DatosUsuario>([]);

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Ordenar "nombre" por first_name + last_name
    this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
      if (sortHeaderId === 'nombre') {
        const fn = (data.first_name || '').toString().trim().toLowerCase();
        const ln = (data.last_name || '').toString().trim().toLowerCase();
        return `${fn} ${ln}`;
      }
      const value = (data as any)[sortHeaderId];
      return (typeof value === 'string') ? value.toLowerCase() : value;
    };

    // Filtro por nombre, apellido, email y matrícula
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const term = (filter || '').trim().toLowerCase();
      const searchable = `${data.first_name || ''} ${data.last_name || ''} ${data.email || ''} ${data.matricula || ''}`.toLowerCase();
      return searchable.indexOf(term) !== -1;
    };
  }

  constructor(
    public facadeService: FacadeService,
    public alumnosService: AlumnosService,
    private router: Router,
    public dialog: MatDialog // <--- Agregar esto
  ) { }

  ngOnInit(): void {
    this.name_user = this.facadeService.getUserCompleteName();
    this.rol = this.facadeService.getUserGroup();
    this.token = this.facadeService.getSessionToken();
    console.log("Token: ", this.token);
    if(this.token == ""){
      this.router.navigate(["/"]);
    }
    if (this.rol === 'administrador' || this.rol === 'maestro') {
       this.displayedColumns.push('editar', 'eliminar');
    }

    this.obtenerAlumnos();
  }

  public applyFilter(filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.dataSource.filter = filterValue;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  public obtenerAlumnos() {
    this.alumnosService.obtenerListaAlumnos().subscribe(
      (response) => {
        this.lista_alumnos = response;
        console.log("Lista users: ", this.lista_alumnos);
        if (this.lista_alumnos.length > 0) {
          this.lista_alumnos.forEach(usuario => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
          console.log("Alumnos: ", this.lista_alumnos);

          this.dataSource = new MatTableDataSource<DatosUsuario>(this.lista_alumnos as DatosUsuario[]);

          // Reasignar el accessor al recrear dataSource
          this.dataSource.sortingDataAccessor = (data: any, sortHeaderId: string) => {
            if (sortHeaderId === 'nombre') {
              const fn = (data.first_name || '').toString().trim().toLowerCase();
              const ln = (data.last_name || '').toString().trim().toLowerCase();
              return `${fn} ${ln}`;
            }
            const value = (data as any)[sortHeaderId];
            return (typeof value === 'string') ? value.toLowerCase() : value;
          };

          setTimeout(() => {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          });
        }
      }, (error) => {
        console.error("Error al obtener la lista de alumnos: ", error);
        alert("No se pudo obtener la lista de alumnos");
      }
    );
  }

  public goEditar(idUser: number) {
    this.router.navigate(["registro-usuarios/alumnos/" + idUser]);
  }

  public delete(idUser: number) {
    // Si el rol es administrador maestro pues entra pero si es alumno, se va y no deja.
    if (this.rol == 'administrador' || this.rol == 'maestro') {

      const dialogRef = this.dialog.open(EliminarUserModalComponent, {
        data: { id: idUser, rol: 'alumno' }, // Pasamos el rol alumno pq es lo que vamos a borrar
        height: '288px',
        width: '328px',
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.isDelete) {
          console.log("Alumno eliminado");
          alert("Alumno eliminado correctamente");
          window.location.reload();
        } else {
          alert("No se eliminó el alumno");
          console.log("No se eliminó el alumno");
        }
      });

    } else {
      // Si el rol es alumno denegamos la acción.
      alert("No tienes permisos para eliminar alumnos.");
    }
  }
}

export interface DatosUsuario {
  id: number;
  matricula: number;
  first_name: string;
  last_name: string;
  email: string;
  fecha_nacimiento: string;
  telefono: string;
  rfc: string;
  curp: string;
}

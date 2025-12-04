import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FacadeService } from './facade.service';
import { ErrorsService } from './tools/errors.service';
import { ValidatorService } from './tools/validator.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  )
  {   }

  public esquemaEvento(){
    return {
      'nombre_evento': '',
      'tipo_evento': '',
      'fecha_realizacion': '',
      'hora_inicio': '',
      'hora_final': '',
      'lugar': '',
      'publico_objetivo': '',
      'programa_educativo': '',
      'descripcion_breve': '',
      'cupo_maximo': '',
      'responsable_id': ''
    }
  }

  //Validación para el formulario
  public validarEvento(data: any){
    console.log("Validando evento... ", data);
    let error: any = {};

    if(!this.validatorService.required(data["nombre_evento"])){
      error["nombre_evento"] = this.errorService.required;
    }else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9 ]+$/.test(data["nombre_evento"])) {
    error["nombre_evento"] = "Solo se permiten letras, números y espacios.";
   }else {
    // Validar formato YYYY-MM-DD (del DatePicker)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data["fecha_realizacion"])) {
      error["fecha_realizacion"] = "Formato de fecha inválido.";
    } else {
      const fechaIngresada = new Date(data["fecha_realizacion"]);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (fechaIngresada < hoy) {
        error["fecha_realizacion"] = "No puedes seleccionar una fecha anterior al día actual.";
      }
    }
  }


    if(!this.validatorService.required(data["tipo_evento"])){
      error["tipo_evento"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["fecha_realizacion"])){
      error["fecha_realizacion"] = this.errorService.required;
    }

    // =====================
// VALIDACIÓN DE HORAS
// =====================

if (!this.validatorService.required(data["hora_inicio"])) {
  error["hora_inicio"] = this.errorService.required;
}

if (!this.validatorService.required(data["hora_final"])) {
  error["hora_final"] = this.errorService.required;
}

// Solo si ambas existen, validar la lógica
if (data["hora_inicio"] && data["hora_final"]) {

  // Comparar solo si NO hubo errores de formato
  if (!error["hora_inicio"] && !error["hora_final"]) {
    const inicio = this.convertirHoraAEntero(data["hora_inicio"]);
    const final = this.convertirHoraAEntero(data["hora_final"]);

    if (inicio >= final) {
      error["hora_final"] = "La hora final debe ser mayor que la hora de inicio.";
    }
  }
}


    if(!this.validatorService.required(data["lugar"])){
      error["lugar"] = this.errorService.required;
    }else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9 ]+$/.test(data["lugar"])) {
    error["lugar"] = "Solo se permiten letras, números y espacios.";
    }

    if(!this.validatorService.required(data["publico_objetivo"])){
      error["publico_objetivo"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["descripcion_breve"])){
      error["descripcion_breve"] = this.errorService.required;
    }else {
     if (data["descripcion_breve"].length > 300) {
       error["descripcion_breve"] = "Máximo 300 caracteres.";
     }
     if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9 .,;:!?()"\-]+$/.test(data["descripcion_breve"])) {
       error["descripcion_breve"] =
        "Solo se permiten letras, números y signos de puntuación básicos.";
     }
    }

    if(!this.validatorService.required(data["cupo_maximo"])){
      error["cupo_maximo"] = this.errorService.required;
    }else if (!/^[0-9]{1,3}$/.test(data["cupo_maximo"])) {
      error["cupo_maximo"] = "Debe ser un número entero positivo de máximo 3 dígitos.";
    }

    return error;
  }
  // registrar evento
  public registrarEvento(data: any): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.post<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  //servicio para obtener lista de eventos
  public obtenerListaEventos(): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/lista-eventos/`, { headers });
  }

  //servicio para obtener un evento por su ID
  public obtenerEventoPorID(idEvento: number): Observable<any> {
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      console.log("No se encontró el token del usuario");
    }
    return this.http.get<any>(`${environment.url_api}/eventos/?id=${idEvento}`, { headers });
  }

  // actualizar evento
  public actualizarEvento(data: any): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.put<any>(`${environment.url_api}/eventos/`, data, { headers });
  }

  //servicio para eliminar un evento
  public eliminarEvento(idEvento: number): Observable<any> {
    // Verificamos si existe el token de sesión
    const token = this.facadeService.getSessionToken();
    let headers: HttpHeaders;
    if (token) {
      headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
    } else {
      headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    return this.http.delete<any>(`${environment.url_api}/eventos/?id=${idEvento}`, { headers });
  }

  private convertirHoraAEntero(hora: string): number {
  // Hora llega como: "02:30 PM" o "11:15 AM"
  const [time, periodo] = hora.split(" ");
  let [h, m] = time.split(":").map(Number);

  if (periodo.toUpperCase() === "PM" && h !== 12) {
    h += 12;
  }

  if (periodo.toUpperCase() === "AM" && h === 12) {
    h = 0;
  }

  return h * 100 + m;  // Ej: 14:30 → 1430
}

}

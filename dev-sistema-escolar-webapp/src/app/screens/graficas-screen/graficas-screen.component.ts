import { Component, ViewChild } from '@angular/core';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { BaseChartDirective } from 'ng2-charts';
import { AdministradoresService } from 'src/app/services/administradores.service';


@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent {

  //Agregar chartjs-plugin-datalabels
  //Variables
  public Alumnos: number = 0;
  public Maestros: number = 0;
  public Administradores: number = 0;

  public total_user: any = {};
  @ViewChild('pieChart', { read: BaseChartDirective }) pieChart?: BaseChartDirective;
  @ViewChild('doughnutChart', { read: BaseChartDirective }) doughnutChart?: BaseChartDirective;
  @ViewChild('barChart', { read: BaseChartDirective }) barChart?: BaseChartDirective;
  @ViewChild('lineChart', { read: BaseChartDirective }) lineChart?: BaseChartDirective;



  //Histograma
  lineChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0,0,0],
        label: 'Registro de ususarios',
        backgroundColor: '#F88406'
      }
    ]
  }
  lineChartOption = {
    responsive:false
  }
  lineChartPlugins = [ DatalabelsPlugin ];

  //Barras
  barChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0,0,0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB',
        ]
      }
    ]
  }
  barChartOption = {
    responsive:false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular
  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  }
  pieChartOption = {
    responsive:false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  // Doughnut
  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data:[0, 0, 0],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  }
  doughnutChartOption = {
    responsive:false
  }
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers(){
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response)=>{
        this.total_user = response;
        console.log("Total usuarios: ", this.total_user);
        this.Administradores = response.admins;
        this.Maestros = response.maestros;
        this.Alumnos = response.alumnos;
        console.log("Alumnos: ", this.Alumnos);
        console.log("Maestros: ", this.Maestros);
        console.log("Administradores: ", this.Administradores);
        //Actualizar datos de la gráfica circular
        this.pieChartData.datasets[0].data = [this.Administradores, this.Maestros, this.Alumnos];
        this.pieChart?.update();
        //Actualizar datos de la gráfica doughnut
        this.doughnutChartData.datasets[0].data = [this.Administradores, this.Maestros, this.Alumnos];
        this.doughnutChart?.update();
        //Actualizar datos de la gráfica de barras
        this.barChartData.datasets[0].data = [this.Administradores, this.Maestros, this.Alumnos];
        this.barChart?.update();
        //Actualizar datos de la gráfica de líneas
        this.lineChartData.datasets[0].data = [this.Administradores, this.Maestros, this.Alumnos];
        this.lineChart?.update();


      }, (error)=>{
        console.log("Error al obtener total de usuarios ", error);

        alert("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }


}

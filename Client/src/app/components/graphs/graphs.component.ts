import { Component, OnInit } from '@angular/core';
import { GraphsService } from '../../services/graphs.service';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.css'],
})
export class GraphsComponent implements OnInit {
  private summary: any = { expensesByCategory: [] };
  private charts: { [key: string]: Chart } = {};

  constructor(private graphsService: GraphsService) {}

  ngOnInit(): void {
    this.loadSummaryData();
  }

  loadSummaryData(): void {
    this.graphsService.getExpenseSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.renderAllCharts();
      },
      error: (err) => {
        console.error('Error fetching summary data:', err);
        alert('No se pudieron obtener los datos del servidor.');
      },
    });
  }

  renderAllCharts(): void {
    this.renderChart(
      'weeklyChart',
      this.calculateProportionalData(this.summary.weeklyExpenses),
      'Semanal'
    );
    this.renderChart(
      'monthlyChart',
      this.calculateProportionalData(this.summary.monthlyExpenses),
      'Mensual'
    );
    this.renderChart(
      'yearlyChart',
      this.calculateProportionalData(this.summary.yearlyExpenses),
      'Anual'
    );
    this.renderChart('totalChart', this.summary.expensesByCategory, 'Total');
  }

  renderChart(chartId: string, data: any[], label: string): void {
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    if (!canvas) return;

    // Destruye el gráfico existente si ya fue creado
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
    }

    // Configuración del gráfico
    const chartConfig: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: data.map((item) => item.categoryName),
        datasets: [
          {
            data: data.map((item) => item.totalAmount),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Gráfico de Gastos (${label})`,
          },
        },
      },
    };

    // Crear el gráfico con configuración válida
   // this.charts[chartId] = new Chart(canvas, chartConfig);
  }

  calculateProportionalData(totalExpenseForRange: number): any[] {
    return this.summary.expensesByCategory.map((item: any) => ({
      categoryName: item.categoryName,
      totalAmount:
        item.totalAmount * (totalExpenseForRange / this.summary.totalExpenses),
    }));
  }
}

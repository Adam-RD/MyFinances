import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GraphsService } from '../../services/graphs.service';
import { ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.css'],
  standalone: false,
})
export class GraphsComponent implements OnInit {
  summary: any = {
    weeklyExpensesByCategory: [],
    monthlyExpensesByCategory: [],
    yearlyExpensesByCategory: [],
    expensesByCategory: [],
  };
  chartData: { name: string; value: number }[] = [];
  selectedChart: string = 'weekly';
  isLoading: boolean = false;

  colorScheme: { name: string; selectable: boolean; group: ScaleType; domain: string[] } = {
    name: 'dynamic',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [],
  };

  constructor(private graphsService: GraphsService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadSummaryData();
  }

  loadSummaryData(): void {
    this.isLoading = true;
    this.graphsService.getExpenseSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.updateChartData();
        this.generateDynamicColors();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los datos:', err);
        this.handleError(err);
        this.isLoading = false;
      },
    });
  }

  updateChartData(): void {
    const dataMapping: Record<string, { categoryName: string; totalAmount: number }[]> = {
      weekly: this.summary.weeklyExpensesByCategory,
      monthly: this.summary.monthlyExpensesByCategory,
      yearly: this.summary.yearlyExpensesByCategory,
      total: this.summary.expensesByCategory,
    };

    if (dataMapping[this.selectedChart]) {
      this.chartData = dataMapping[this.selectedChart].map((item) => ({
        name: item.categoryName,
        value: item.totalAmount,
      }));
    } else {
      console.error('selectedChart no es válido.');
      this.chartData = [];
    }
  }

  generateDynamicColors(): void {
    const baseColors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#33FFA5'];
    this.colorScheme.domain = this.chartData.map((_, index) => baseColors[index % baseColors.length]);
  }

  onChartSelectionChange(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.updateChartData();
      this.generateDynamicColors();
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 500);
  }

  getChartTitle(): string {
    switch (this.selectedChart) {
      case 'weekly':
        return 'Gastos de esta semana';
      case 'monthly':
        return 'Gastos de este mes';
      case 'yearly':
        return 'Gastos del año';
      case 'total':
        return 'Gastos Totales';
      default:
        return 'Gráfico';
    }
  }

  handleError(error: any): void {
    const errorMessage =
      error?.message || 'No se pudieron obtener los datos del servidor. Por favor, intenta nuevamente.';
    console.error(errorMessage);
  }
}

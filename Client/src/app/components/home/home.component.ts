import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { ExpenseService } from '../../services/expense.service';
import { ToastrService } from 'ngx-toastr';
import { IncomeService } from '../../services/income.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    standalone: false
})
export class HomeComponent implements OnInit {
  currentPage: number = 1;
  categoriesPage: number = 1;
  categories: any[] = [];
  expenses: any[] = [];
  incomes: any[] = [];
  summary: any = { totalExpenses: 0, weeklyExpenses: 0, monthlyExpenses: 0, yearlyExpenses: 0 };
  incomeSummary: any = { totalIncomes: 0, totalExpenses: 0, balance: 0 };
  totalBalance: number = 0; 
  isLoading = false;
  newCategory = '';
  newExpense: any = { description: '', amount: 0, date: '', categoryId: 0 };
  maxDate: string = '';

  constructor(
    private categoryService: CategoryService,
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initializeData();
    this.setMaxDate();
  }

  setMaxDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Meses van de 0 a 11
    const day = currentDate.getDate().toString().padStart(2, '0');
    this.maxDate = `${year}-${month}-${day}`;
  }

  async initializeData() {
    this.isLoading = true;
    try {
      await this.loadCategories();
      await this.loadExpenses();
      await this.loadSummary();
      await this.loadIncomes();
      this.calculateBalance();
    } catch (error) {
      this.toastr.error('Error al cargar los datos. Reintentando...', 'Error');
      setTimeout(() => this.initializeData(), 3000); 
    } finally {
      this.isLoading = false;
    }
  }

  // Métodos de carga, cálculo y manipulación permanecen sin cambios.



  async loadCategories(): Promise<void> {
    try {
      const data = await this.categoryService.getCategories().toPromise();
      this.categories = data;
      if (this.categories.length > 0) {
        this.newExpense.categoryId = this.categories[0].id;
      }
    } catch (error) {
      this.toastr.error('Error al cargar las categorías', 'Error');
      throw error;
    }
  }

  async loadExpenses(): Promise<void> {
    try {
      const data = await this.expenseService.getExpenses().toPromise();
      this.expenses = data;
    } catch (error) {
      this.toastr.error('Error al cargar los gastos', 'Error');
      throw error;
    }
  }

  async loadSummary(): Promise<void> {
    try {
      const data = await this.expenseService.getSummary().toPromise();
      if (data && this.categories.length > 0) {
        // Mapea los datos para incluir nombres de categorías
        this.summary = {
          ...data,
          expensesByCategory: this.categories.map((category) => {
            const categoryExpense = data.expensesByCategory.find(
              (item: any) => item.categoryId === category.id
            );
            return {
              categoryName: category.name,
              totalAmount: categoryExpense ? categoryExpense.totalAmount : 0,
            };
          }),
        };
      } else {
        this.summary = {
          totalExpenses: 0,
          weeklyExpenses: 0,
          monthlyExpenses: 0,
          yearlyExpenses: 0,
          expensesByCategory: [],
        };
      }
    } catch (error) {
      this.toastr.error('Error al cargar el resumen', 'Error');
      this.summary = { totalExpenses: 0, weeklyExpenses: 0, monthlyExpenses: 0, yearlyExpenses: 0 };
      throw error;
    }
  }
  

  async loadIncomes(): Promise<void> {
    try {
      const data = await this.incomeService.getIncomes().toPromise();
      this.incomes = data || [];
    } catch (error) {
      this.toastr.error('Error al cargar los ingresos', 'Error');
      this.incomes = [];
      throw error;
    }
  }

  calculateBalance() {
    const totalExpenses = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncomes = this.incomes.reduce((sum, income) => sum + income.amount, 0);
    this.totalBalance = totalIncomes - totalExpenses;

    this.incomeSummary.totalExpenses = totalExpenses;
    this.incomeSummary.totalIncomes = totalIncomes;
    this.incomeSummary.balance = this.totalBalance;
  }

  async addCategory() {
    if (this.newCategory.trim()) {
      this.isLoading = true;
      try {
        await this.categoryService.addCategory({ name: this.newCategory }).toPromise();
        this.toastr.success('Categoría agregada con éxito', 'Éxito');
        this.newCategory = '';
        await this.loadCategories();
      } catch (error) {
        this.toastr.error('Error al agregar la categoría', 'Error');
      } finally {
        this.isLoading = false;
      }
    }
  }

  async deleteCategory(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      this.isLoading = true;
      try {
        await this.categoryService.deleteCategory(id).toPromise();
        this.toastr.success('Categoría eliminada con éxito', 'Éxito');
        await this.loadCategories();
      } catch (error) {
        this.toastr.error('No se puede eliminar, porque está relacionada a un gasto', 'Error');
      } finally {
        this.isLoading = false;
      }
    }
  }

  async addExpense() {
    this.isLoading = true;
    try {
      await this.expenseService.addExpense(this.newExpense).toPromise();
      this.toastr.success('Gasto agregado con éxito', 'Éxito');
      this.newExpense = { description: '', amount: 0, date: '', categoryId: this.categories.length > 0 ? this.categories[0].id : 0 };
      await this.loadExpenses();
      await this.loadSummary();
      this.calculateBalance();
    } catch (error) {
      this.toastr.error('Error al agregar el gasto', 'Error');
    } finally {
      this.isLoading = false;
    }
  }

  async deleteExpense(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      this.isLoading = true;
      try {
        await this.expenseService.deleteExpense(id).toPromise();
        this.toastr.success('Gasto eliminado con éxito', 'Éxito');
        await this.loadExpenses();
        await this.loadSummary();
        this.calculateBalance();
      } catch (error) {
        this.toastr.error('Error al eliminar el gasto', 'Error');
      } finally {
        this.isLoading = false;
      }
    }
  }
}

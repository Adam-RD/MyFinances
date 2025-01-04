import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../services/category.service';
import { ExpenseService } from '../../services/expense.service';
import { ToastrService } from 'ngx-toastr';
import { IncomeService } from '../../services/income.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: false,
})
export class HomeComponent implements OnInit {
  currentPage: number = 1;
  categoriesPage: number = 1;
  categories: any[] = [];
  expenses: any[] = [];
  incomes: any[] = [];
  summary: any = {
    totalExpenses: 0,
    weeklyExpenses: 0,
    monthlyExpenses: 0,
    yearlyExpenses: 0,
  };
  incomeSummary: any = { totalIncomes: 0, totalExpenses: 0, balance: 0 };
  totalBalance: number = 0;
  isLoading = false;
  newCategory = '';
  newExpense: any = { description: '', amount: null, date: '', categoryId: 0 };
  formattedAmount: string = '';
  maxDate: string = '';

  showDeleteModal: boolean = false;
  idToDelete: number | null = null;
  deleteType: 'expense' | 'category' | null = null;

  isEditModalOpen: boolean = false;
  editExpense: any = { description: '', amount: null, date: '', categoryId: 0 };

  isEditCategoryModalOpen: boolean = false;
  editCategory: any = { id: 0, name: '' };

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
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    this.maxDate = `${year}-${month}-${day}`;
  }

  onAmountChange(value: string) {
    if (!/^[0-9,]*$/.test(value)) {
      this.toastr.error('Solo se permiten caracteres numéricos.', 'Error');
      return;
    }

    let numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) {
      this.formattedAmount = '';
      this.newExpense.amount = null;
      return;
    }

    let num = parseFloat(numericValue);
    this.formattedAmount = num.toLocaleString('es-ES');
    this.newExpense.amount = num;
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
      this.summary = {
        totalExpenses: 0,
        weeklyExpenses: 0,
        monthlyExpenses: 0,
        yearlyExpenses: 0,
      };
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

  async addExpense() {
    this.isLoading = true;
    try {
      await this.expenseService.addExpense(this.newExpense).toPromise();
      this.toastr.success('Gasto agregado con éxito', 'Éxito');
      this.newExpense = {
        description: '',
        amount: 0,
        date: '',
        categoryId: this.categories.length > 0 ? this.categories[0].id : 0,
      };
      await this.loadExpenses();
      await this.loadSummary();
      this.calculateBalance();
    } catch (error) {
      this.toastr.error('Error al agregar el gasto', 'Error');
    } finally {
      this.isLoading = false;
    }
  }

  // Abrir modal de confirmación
  openDeleteModal(id: number, type: 'expense' | 'category') {
    this.idToDelete = id;
    this.deleteType = type;
    this.showDeleteModal = true;
  }

  // Cerrar modal de confirmación
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.idToDelete = null;
    this.deleteType = null;
  }

  // Confirmar eliminación
  async confirmDelete() {
    if (this.idToDelete !== null && this.deleteType !== null) {
      this.isLoading = true;
      try {
        if (this.deleteType === 'expense') {
          await this.expenseService.deleteExpense(this.idToDelete).toPromise();
          this.toastr.success('Gasto eliminado con éxito', 'Éxito');
          await this.loadExpenses();
          await this.loadSummary();
          this.calculateBalance();
        } else if (this.deleteType === 'category') {
          await this.categoryService.deleteCategory(this.idToDelete).toPromise();
          this.toastr.success('Categoría eliminada con éxito', 'Éxito');
          await this.loadCategories();
        }
      } catch (error) {
        const errorMessage =
          this.deleteType === 'expense'
            ? 'Error al eliminar el gasto'
            : 'No se puede eliminar, porque está relacionada a un gasto';
        this.toastr.error(errorMessage, 'Error');
      } finally {
        this.isLoading = false;
        this.closeDeleteModal();
      }
    }
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

  openEditModal(expense: any) {
    console.log('Abrir modal de edición:', expense);
    this.editExpense = { ...expense };
    this.isEditModalOpen = true;
  }


  closeEditModal() {
    this.isEditModalOpen = false;
    this.editExpense = { description: '', amount: 0, date: '', categoryId: 0 };
  }

  openEditCategoryModal(category: any) {
    this.editCategory = { ...category };
    this.isEditCategoryModalOpen = true;
  }

  closeEditCategoryModal() {
    this.isEditCategoryModalOpen = false;
    this.editCategory = { id: 0, name: '' };
  }

  async updateCategory() {
    this.isLoading = true;
    try {
      await this.categoryService.updateCategory(this.editCategory.id, { name: this.editCategory.name }).toPromise();
      this.toastr.success('Categoría actualizada con éxito', 'Éxito');
      await this.loadCategories();
      this.closeEditCategoryModal();
    } catch (error) {
      this.toastr.error('Error al actualizar la categoría', 'Error');
    } finally {
      this.isLoading = false;
    }
  }

  async updateExpense() {
    this.isLoading = true;
    try {
      await this.expenseService.updateExpense(this.editExpense.id, this.editExpense).toPromise();
      this.toastr.success('Gasto actualizado con éxito', 'Éxito');
      await this.loadExpenses();
      await this.loadSummary();
      this.calculateBalance();
      this.closeEditModal();
    } catch (error) {
      this.toastr.error('Error al actualizar el gasto', 'Error');
    } finally {
      this.isLoading = false;
    }
  }
// Exportar a Excel
  exportToExcel(): void {
  
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([
        ["#", "Descripción", "Monto", "Fecha", "Categoría"]
    ]);


    this.expenses.forEach((expense, index) => {
        XLSX.utils.sheet_add_aoa(ws, [[
            index + 1,
            expense.description,
            expense.amount,
            new Date(expense.date).toLocaleDateString(),
            expense.categoryName
        ]], { origin: -1 });
    });


    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Detalles de Gastos');


    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, 'Detalles_Gastos.xlsx');
}

}

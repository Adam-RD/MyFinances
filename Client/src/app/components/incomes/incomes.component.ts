import { Component, OnInit } from '@angular/core';
import { IncomeService } from '../../services/income.service';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-incomes',
  templateUrl: './incomes.component.html',
  styleUrls: ['./incomes.component.css'],
  standalone: false
})
export class IncomesComponent implements OnInit {
  incomes: any[] = [];
  incomeSummary: any = { totalIncomes: 0, totalExpenses: 0, balance: 0 };
  isLoading = false;
  newIncome: any = { description: '', amount: 0, date: '' };
  currentPage: number = 1;

  // Variables para el modal de confirmación
  showDeleteModal: boolean = false;
  idToDelete: number | null = null;

  // Variables para el modal de edición
  showEditModal: boolean = false;
  incomeToEdit: any = { id: null, description: '', amount: 0, date: '' };

  constructor(
    private incomeService: IncomeService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadIncomes();
    this.loadIncomeSummary();
  }

  loadIncomes(): void {
    this.isLoading = true;
    this.incomeService.getIncomes()
      .pipe(
        catchError((error) => {
          this.handleHttpError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (data) => {
          this.incomes = data || [];
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  loadIncomeSummary(): void {
    this.isLoading = true;
    this.incomeService.getIncomeSummary()
      .pipe(
        catchError((error) => {
          this.handleHttpError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (data) => {
          this.incomeSummary = data;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  addIncome(): void {
    if (!this.newIncome.description || !this.newIncome.amount || !this.newIncome.date) {
      this.toastr.error('Todos los campos son obligatorios.', 'Error');
      return;
    }

    this.isLoading = true;
    this.incomeService.addIncome(this.newIncome)
      .pipe(
        catchError((error) => {
          this.handleHttpError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Ingreso agregado con éxito.', 'Éxito');
          this.newIncome = { description: '', amount: 0, date: '' };
          this.loadIncomes();
          this.loadIncomeSummary();
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }

  openDeleteModal(id: number): void {
    this.idToDelete = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.idToDelete = null;
  }

  confirmDelete(): void {
    if (this.idToDelete !== null) {
      this.isLoading = true;
      this.incomeService.deleteIncome(this.idToDelete)
        .pipe(
          catchError((error) => {
            this.handleHttpError(error);
            return throwError(() => error);
          })
        )
        .subscribe({
          next: () => {
            this.toastr.success('Ingreso eliminado con éxito.', 'Éxito');
            this.loadIncomes();
            this.loadIncomeSummary();
          },
          complete: () => {
            this.isLoading = false;
            this.closeDeleteModal();
          }
        });
    }
  }

  openEditModal(income: any): void {
    this.incomeToEdit = { ...income };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.incomeToEdit = { id: null, description: '', amount: 0, date: '' };
  }

  confirmEdit(): void {
    if (!this.incomeToEdit.description || !this.incomeToEdit.amount || !this.incomeToEdit.date) {
      this.toastr.error('Todos los campos son obligatorios.', 'Error');
      return;
    }

    this.isLoading = true;
    this.incomeService.updateIncome(this.incomeToEdit.id, this.incomeToEdit)
      .pipe(
        catchError((error) => {
          this.handleHttpError(error);
          return throwError(() => error);
        })
      )
      .subscribe({
        next: () => {
          this.toastr.success('Ingreso actualizado con éxito.', 'Éxito');
          this.loadIncomes();
          this.loadIncomeSummary();
        },
        complete: () => {
          this.isLoading = false;
          this.closeEditModal();
        }
      });
  }

  private handleHttpError(error: any): void {
    if (error.status === 400) {
      this.toastr.error('Datos inválidos.', 'Error');
    } else if (error.status === 500) {
      this.toastr.error('Error del servidor.', 'Error');
    } else {
      this.toastr.error('Error desconocido.', 'Error');
    }
  }
}

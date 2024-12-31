import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  private apiUrl = 'https://localhost:7096/api/Incomes';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Obtener ingresos
  getIncomes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, { headers: this.getAuthHeaders() });
  }

  // Obtener el resumen de ingresos
  getIncomeSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`, { headers: this.getAuthHeaders() });
  }

  // Obtener el balance, ingresos totales y gastos totales
  getBalance(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/balance`, { headers: this.getAuthHeaders() });
  }

  // Agregar un ingreso
  addIncome(income: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, income, { headers: this.getAuthHeaders() });
  }

  // Eliminar un ingreso
  deleteIncome(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private apiUrl = 'https://localhost:7096/api/expenses';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Obtener gastos
  getExpenses(): Observable<any> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // Obtener detalles de gastos
  getExpenseDetails(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  // Obtener el resumen de gastos
  getSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/summary`, { headers: this.getAuthHeaders() });
  }

  // Agregar un gasto
  addExpense(expense: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, expense, { headers: this.getAuthHeaders() });
  }

  // Eliminar un gasto
  deleteExpense(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}

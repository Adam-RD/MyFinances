import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  
  private apiUrl = `${environment.apiUrl}/expenses`;


  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

 
  getExpenses(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getAuthHeaders() });
  }
 
  getExpenseDetails(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }


  getSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`, { headers: this.getAuthHeaders() });
  }


  addExpense(expense: any): Observable<any> {
    return this.http.post(this.apiUrl, expense, { headers: this.getAuthHeaders() });
  }

  
  deleteExpense(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

 
  updateExpense(id: number, expense: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, expense, { headers: this.getAuthHeaders() });
  }
  

  
  getExpensesByDateRange(startDate: string, endDate: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/range?startDate=${startDate}&endDate=${endDate}`, {
      headers: this.getAuthHeaders(),
    });
  }
  
  getExpensesByCategory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories-summary`, { headers: this.getAuthHeaders() });
  }
}

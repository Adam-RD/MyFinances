import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GraphsService {
  private apiUrl = 'https://localhost:7096/api/expenses'; 

  constructor(private http: HttpClient) {}

  
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  
  private handleError(error: any): Observable<never> {
    console.error('Error en la solicitud HTTP:', error);
    return throwError(() => new Error(error.message || 'Error en el servidor.'));
  }

 
  getExpenseSummary(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/summary`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }



  getExpensesByCategory(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/categories-summary`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }

 
  getExpensesByDateRange(startDate: string, endDate: string): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/range?startDate=${startDate}&endDate=${endDate}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  
  getCategoryGraphs(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/categories-graphs`, { headers: this.getAuthHeaders() })
      .pipe(catchError(this.handleError));
  }
}

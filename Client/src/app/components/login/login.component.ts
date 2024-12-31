import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr'; // Importación de ToastrService
import { LoginRequest } from '../../Models/LoginRequest';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginData: LoginRequest = { username: '', password: '' };
  isLoading = false; // Estado de carga
  showPassword = false; // Control de visibilidad de la contraseña

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService // Inyección de ToastrService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    this.isLoading = true; // Inicia el indicador de carga
    try {
      const response = await this.authService.login(this.loginData).toPromise();
      if (response && response.token) {
        this.authService.saveToken(response.token);
        this.toastr.success('Inicio de sesión exitoso.', 'Éxito'); // Notificación de éxito
        this.router.navigate(['/home']); // Redirige al usuario
      } else {
        throw new Error('Token no recibido');
      }
    } catch (error) {
      console.error('Login failed:', error);
      this.toastr.error('Usuario o contraseña inválidos. Inténtalo de nuevo.', 'Error de inicio de sesión'); // Notificación de error
    } finally {
      this.isLoading = false; // Finaliza el indicador de carga
    }
  }
}

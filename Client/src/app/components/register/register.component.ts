import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { RegisterRequest } from '../../Models/RegisterRequest';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  registerData: RegisterRequest = { username: '', password: '', confirmPassword: '' };
  isLoading = false;
  passwordMismatch = false; // Estado para verificar si las contraseñas coinciden
  showPassword = false; // Control de visibilidad de la contraseña principal
  showConfirmPassword = false; // Control de visibilidad de la confirmación de contraseña

  constructor(private authService: AuthService, private router: Router) {}

  validatePasswords() {
    this.passwordMismatch = this.registerData.password !== this.registerData.confirmPassword;
  }

  togglePasswordVisibility(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    this.validatePasswords();
    if (this.passwordMismatch) {
      return;
    }

    this.isLoading = true;
    this.authService.register(this.registerData).subscribe({
      next: () => {
        this.authService.toastr.success('Registro exitoso.', 'Éxito');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}

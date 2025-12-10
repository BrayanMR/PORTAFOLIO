import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('portafolio');
  protected readonly menuOpen = signal(false);
  protected readonly galleryOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(value => !value);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  openGallery() {
    this.galleryOpen.set(true);
    document.body.style.overflow = 'hidden'; // Deshabilita scroll del body
  }

  closeGallery() {
    this.galleryOpen.set(false);
    document.body.style.overflow = ''; // Rehabilita scroll del body
  }

  onSubmitContact(event: Event) {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const contactData = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };
    
    // Aquí puedes integrar con un servicio de email como EmailJS, FormSpree, etc.
    console.log('Datos del formulario:', contactData);
    
    // Mostrar mensaje de éxito
    alert('¡Gracias por tu mensaje! Te contactaré pronto.');
    
    // Limpiar el formulario
    form.reset();
  }
}

import { Component, signal, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  protected readonly title = signal('portafolio');
  protected readonly menuOpen = signal(false);
  protected readonly galleryOpen = signal(false);
  protected readonly showSensitiveInfo = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitStatus = signal<'success' | 'error' | null>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          } else {
            // Permite que la animación se repita cuando se hace scroll hacia arriba
            entry.target.classList.remove('active');
          }
        });
      }, observerOptions);

      // Observar todos los elementos que tengan la clase reveal
      const revealElements = document.querySelectorAll('.reveal');
      revealElements.forEach(el => observer.observe(el));
    }
  }

  toggleMenu() {
    this.menuOpen.update(value => !value);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  openGallery() {
    this.galleryOpen.set(true);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden'; // Deshabilita scroll del body
    }
  }

  closeGallery() {
    this.galleryOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = ''; // Rehabilita scroll del body
    }
  }

  toggleSensitiveInfo() {
    this.showSensitiveInfo.update(val => !val);
  }

  onSubmitContact(event: Event) {
    event.preventDefault();
    this.isSubmitting.set(true);
    this.submitStatus.set(null);
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Endpoint de Formspree vinculado a bryn9105@gmail.com
    const formspreeEndpoint = 'https://formspree.io/f/mbdnjnrp';
    
    fetch(formspreeEndpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      this.isSubmitting.set(false);
      if (response.ok) {
        this.submitStatus.set('success');
        form.reset();
      } else {
        this.submitStatus.set('error');
      }
    })
    .catch(error => {
      this.isSubmitting.set(false);
      this.submitStatus.set('error');
      console.error('Error al enviar formulario:', error);
    });
  }
}

import { AfterViewInit, Component, DestroyRef, ElementRef, Inject, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements AfterViewInit {
  protected readonly title = signal('Brayan Mosos - Portafolio');
  protected readonly menuOpen = signal(false);
  protected readonly galleryOpen = signal(false);
  protected readonly isSubmitting = signal(false);
  protected readonly submitStatus = signal<'success' | 'error' | null>(null);

  // Form field error signals for inline validation
  protected readonly nameError = signal<string | null>(null);
  protected readonly emailError = signal<string | null>(null);
  protected readonly messageError = signal<string | null>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId) || !('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.replace('reveal-pending', 'reveal-entered');
          observer.unobserve(entry.target);
        }
      }
    });

    const viewportHeight = window.innerHeight;
    const belowViewport = Array.from(this.host.nativeElement.querySelectorAll('.reveal'))
      .filter(element => element.getBoundingClientRect().top >= viewportHeight);

    for (const element of belowViewport) {
      element.classList.add('reveal-pending');
      observer.observe(element);
    }

    this.destroyRef.onDestroy(() => observer.disconnect());
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
      document.body.style.overflow = 'hidden';
    }
  }

  closeGallery() {
    this.galleryOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  onSubmitContact(event: Event) {
    event.preventDefault();
    
    // Clear previous errors
    this.nameError.set(null);
    this.emailError.set(null);
    this.messageError.set(null);
    this.submitStatus.set(null);

    const form = event.target as HTMLFormElement;
    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    const messageInput = form.elements.namedItem('message') as HTMLTextAreaElement;

    let hasError = false;

    if (!nameInput.value.trim()) {
      this.nameError.set('Por favor ingresa tu nombre.');
      hasError = true;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      this.emailError.set('Por favor ingresa tu correo electrónico.');
      hasError = true;
    } else if (!emailPattern.test(emailInput.value.trim())) {
      this.emailError.set('Ingresa un correo electrónico válido.');
      hasError = true;
    }

    if (!messageInput.value.trim()) {
      this.messageError.set('Por favor cuéntame brevemente sobre tu proyecto o consulta.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    this.isSubmitting.set(true);
    const formData = new FormData(form);

    // Formspree endpoint conectado al correo real del portafolio (bryn9105@gmail.com)
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

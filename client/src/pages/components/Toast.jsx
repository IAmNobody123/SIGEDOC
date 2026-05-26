import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const Toast = {
  success: (title, text = '') => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'swal2-radius swal2-border',
      },
    });
  },

  error: (title, text = '') => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'swal2-radius swal2-border',
      },
    });
  },

  info: (title, text = '') => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonText: 'Aceptar',
      customClass: {
        popup: 'swal2-radius swal2-border',
      },
    });
  },

  toastSuccess: (message) => {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: '#f6ffed',
      color: '#0b7226',
    });
  },

  toastError: (message) => {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: '#fff1f0',
      color: '#a8071a',
    });
  },

  confirmAction: async ({
    title = '¿Estás seguro?',
    text = '',
    confirmButtonText = 'Sí',
    cancelButtonText = 'No',
    icon = 'warning',
  } = {}) => {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
      customClass: {
        popup: 'swal2-radius swal2-border',
      },
    });

    return result.isConfirmed;
  },
};

export default Toast;


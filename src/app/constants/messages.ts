export const MESSAGES = {
  login: {
    title: 'LegalTech CO',
    subtitle: 'Gestión Jurídica Profesional',
    userLabel: 'Usuario o Correo Electrónico',
    passwordLabel: 'Contraseña',
    mfaCodeLabel: 'Código de Verificación (MFA)',
    loginButton: 'Ingresar al Sistema',
    verifyButton: 'Verificar Código',
    noAccountText: '¿No tienes cuenta?',
    registerLinkText: 'Regístrate aquí',
    invalidCredentials: 'Credenciales inválidas. Verifica tu usuario y contraseña.',
    connectionError: 'Sistema no disponible.',
    serverError: 'Error del servidor. Por favor intenta de nuevo más tarde.',
    genericError: 'Error al iniciar sesión. Intenta de nuevo.',
    invalidMfaCode: 'Código MFA inválido. Verifica el código e intenta de nuevo.',
    mfaError: 'Error al verificar el código MFA. Intenta de nuevo.'
  },
  register: {
    title: 'LegalTech CO',
    subtitle: 'Crear Nueva Cuenta',
    emailLabel: 'Email',
    usernameLabel: 'Usuario',
    passwordLabel: 'Contraseña',
    confirmPasswordLabel: 'Confirmar Contraseña',
    phoneLabel: 'Teléfono',
    phonePlaceholder: '+57',
    registerButton: 'Registrar',
    cancelButton: 'Cancelar',
    haveAccountText: '¿Ya tienes cuenta?',
    loginLinkText: 'Inicia sesión aquí',
    invalidEmail: 'Email no válido',
    usernameMinLength: 'Mínimo 3 caracteres',
    passwordMinLength: 'Mínimo 6 caracteres',
    passwordMismatch: 'Las contraseñas no coinciden',
    phoneFormatError: 'Formato: +57 y 9-10 dígitos',
    loadingText: 'Registrando...'
  },
  process: {
    title: 'Radicación y Análisis Clínico de Procesos',
    responseDescription: 'Respuesta POST del módulo Radicación y Análisis Clínico de Procesos.',
    successMessage: 'Conexión exitosa. El análisis ha concluido.',
    connectionError: 'Imposible establecer conexión REST con localhost:8080.',
    corsAdvice: 'Asegúrate de que tu servicio Spring Boot esté levantado en el puerto 8080.',
    sentenceAccepted: 'Sentencia aceptada. La respuesta fue confirmada en el modal.',
    exportFilename: 'radicacion-analisis-proceso.doc',
    exportTitle: 'Radicación y Análisis Clínico de Procesos'
  },
  recentNotifications: {
    title: 'Procesos con Notificaciones Recientes',
    searchPlaceholder: 'Buscar por radicado, despacho o tipo...',
    loading: 'Obteniendo notificaciones...',
    noData: 'No hay notificaciones recientes para mostrar.'
  },
  general: {
    registrationSuccess: 'Registro exitoso. Redirigiendo al login...',
    registrationFailed: 'Registro fallido. Por favor intenta de nuevo.',
    registrationError: 'Error al registrar. Por favor intenta de nuevo.'
  }
};

export const EMAIL_CONSTANTS = {
  PORT: 587,
  HOST: 'smtp.gmail.com',
  SUBJECT_WELCOME_CLUB: '¡Bienvenido/a al Club!',
  SUBJECT_REMOVE_CLUB: 'Confirmación de Baja del Club',
  MESSAGE_WELCOME_CLUB: (playerName: string, clubName: string) => `
    <p>Estimado/a <strong>${playerName}</strong>,</p>

    <p>Nos complace darte la bienvenida a <strong>${clubName}</strong>. Estamos emocionados de tenerte como parte de nuestro equipo. A continuación, te recordamos algunos detalles importantes:</p>

    <p><strong>Detalles del Club:</strong></p>
    <ul>
        <li>Club: ${clubName}</li>
        <li>Fecha de Alta: ${new Date().toLocaleDateString('es-ES')}</li>
    </ul>

    <p>Tu talento y esfuerzo contribuirán al crecimiento y éxito de nuestro club. Nos comprometemos a brindarte las mejores oportunidades para que puedas desarrollarte y alcanzar tus objetivos. ¡Estamos muy felices de contar contigo!</p>

    <p>Si tienes alguna duda o necesitas más información, no dudes en ponerte en contacto con nosotros.</p>

    <p>¡Bienvenido/a a la familia de ${clubName}!</p>

    <p>Atentamente,<br>
    <strong>${clubName}</strong><br>
    `,
  MESSAGE_REMOVE_CLUB: (playerName: string, clubName: string) => `
    <p>Estimado/a <strong>${playerName}</strong>,</p>

    <p>Lamentamos informarte que tu baja de <strong>${clubName}</strong> ha sido procesada exitosamente. Agradecemos el tiempo y esfuerzo que has dedicado a nuestro club y queremos expresarte nuestro reconocimiento por todo lo que aportaste durante tu tiempo con nosotros.</p>

    <p><strong>Detalles de la Baja:</strong></p>
    <ul>
        <li>Club: ${clubName}</li>
        <li>Fecha de Baja: ${new Date().toLocaleDateString('es-ES')}</li>
    </ul>

    <p>Te deseamos mucho éxito en tus futuros proyectos y esperamos que tu experiencia con nosotros haya sido enriquecedora. Si en algún momento decides regresar, las puertas de <strong>${clubName}</strong> siempre estarán abiertas para ti.</p>

    <p>Para cualquier consulta o si necesitas más detalles, no dudes en ponerte en contacto.</p>

    <p>Te deseamos lo mejor en esta nueva etapa.</p>

    <p>Atentamente,<br>
    <strong>${clubName}</strong><br>
  `,
};
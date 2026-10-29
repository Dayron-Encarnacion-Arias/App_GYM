/**
 * Reintenta una operación asíncrona. En Docker Compose los contenedores arrancan
 * casi a la vez, así que la base de datos o RabbitMQ pueden tardar unos segundos.
 */
module.exports = async function retry(fn, { retries = 20, delayMs = 3000, label = 'operación' } = {}) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= retries) throw error;
      console.warn(`[retry] ${label} falló (intento ${attempt}/${retries}): ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

// src/utils/debug.js
/**
 * Utilitaire pour le débogage
 * Ajoute des fonctions pour suivre le flux d'exécution et aider à diagnostiquer les problèmes
 */

// Activer/désactiver le mode debug
const DEBUG_MODE = process.env.NODE_ENV === 'development';

/**
 * Journalise un message de débogage si le mode debug est activé
 * @param {string} context - Le contexte du message (ex: "AuthContext", "ProtectedRoute")
 * @param {string} message - Le message à journaliser
 * @param {any} data - Données supplémentaires à journaliser (optionnel)
 */
export const debugLog = (context, message, data = null) => {
  if (!DEBUG_MODE) return;
  
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = `[${timestamp}][${context}]`;
  
  if (data !== null) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

/**
 * Journalise une erreur de débogage
 * @param {string} context - Le contexte de l'erreur
 * @param {string} message - Le message d'erreur
 * @param {Error|any} error - L'objet erreur ou données d'erreur
 */
export const debugError = (context, message, error) => {
  if (!DEBUG_MODE) return;
  
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = `[${timestamp}][${context}][ERROR]`;
  
  console.error(`${prefix} ${message}`, error);
};

/**
 * Journalise l'entrée dans une fonction
 * @param {string} context - Le contexte (composant ou service)
 * @param {string} functionName - Le nom de la fonction
 * @param {any} args - Les arguments de la fonction (optionnel)
 */
export const debugEnter = (context, functionName, args = null) => {
  if (!DEBUG_MODE) return;
  
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = `[${timestamp}][${context}]`;
  
  if (args !== null) {
    console.log(`${prefix} ENTER: ${functionName}()`, args);
  } else {
    console.log(`${prefix} ENTER: ${functionName}()`);
  }
};

/**
 * Journalise la sortie d'une fonction
 * @param {string} context - Le contexte (composant ou service)
 * @param {string} functionName - Le nom de la fonction
 * @param {any} result - Le résultat de la fonction (optionnel)
 */
export const debugExit = (context, functionName, result = null) => {
  if (!DEBUG_MODE) return;
  
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = `[${timestamp}][${context}]`;
  
  if (result !== null) {
    console.log(`${prefix} EXIT: ${functionName}() =>`, result);
  } else {
    console.log(`${prefix} EXIT: ${functionName}()`);
  }
};

/**
 * Crée une fonction enveloppante pour déboguer une fonction existante
 * @param {string} context - Le contexte de la fonction
 * @param {string} functionName - Le nom de la fonction
 * @param {Function} fn - La fonction à déboguer
 * @returns {Function} Fonction enveloppante avec débogage
 */
export const debugWrap = (context, functionName, fn) => {
  if (!DEBUG_MODE) return fn;
  
  return (...args) => {
    debugEnter(context, functionName, args);
    try {
      const result = fn(...args);
      
      // Si c'est une promesse, ajouter des logs pour la résolution ou le rejet
      if (result instanceof Promise) {
        return result
          .then(value => {
            debugExit(context, functionName, value);
            return value;
          })
          .catch(error => {
            debugError(context, `Error in ${functionName}()`, error);
            throw error;
          });
      }
      
      debugExit(context, functionName, result);
      return result;
    } catch (error) {
      debugError(context, `Error in ${functionName}()`, error);
      throw error;
    }
  };
};

export default {
  debugLog,
  debugError,
  debugEnter,
  debugExit,
  debugWrap
};
import type { Request, Response, NextFunction } from 'express';

// ZodSchema: el tipo genérico de TODOS los schemas de Zod
// (ZodObject, ZodString, ZodUnion…). Al tipar con ZodSchema,
// la factory acepta cualquier schema sin importar su estructura interna.
import type { ZodSchema } from 'zod';
/**
 * FACTORY de middleware de VALIDACIÓN con Zod.
 *
 * Recibe un schema Zod y una fuente de datos (body, query, params)
 * y devuelve un middleware que:
 *   1. Extrae los datos del request (req.body, req.query, req.params)
 *   2. Los valida contra el schema con safeParse
 *   3. Si falla → 400 con los errores de Zod formateados
 *   4. Si pasa → reemplaza req[source] con el dato parseado y tipado
 *
 * Uso en rutas:
 *   router.post('/', validate(createPatientSchema), handler)
 *   router.get('/', validate(listPatientsQuery, 'query'), handler)
 *   router.put('/:id', validate(updatePatientSchema), handler)
 *
 * DEBE montarse después de verifyToken/authorize y antes del handler.
 */
export function validate(schema: ZodSchema,  
  // Fuente de datos a validar. Default 'body' porque la mayoría
  // de los casos son POST/PUT con JSON en el body.
   source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
       // safeParse (en vez de parse):
    //   - parse   → lanza excepción si falla (hay que hacer try/catch)
    //   - safeParse → devuelve { success: true, data } | { success: false, error }
    // safeParse es más limpio en un middleware: no necesitas try/catch.
    const result = schema.safeParse(req[source]);
    // Si la validación falló:
    if (!result.success) {
        // 400 Bad Request (no 422): el request es malformado,
      // no que los datos sean "semánticamente inválidos".
      //
      // result.error.flatten() devuelve:
      //   {
      //     formErrors: [],           // errores a nivel de formulario
      //     fieldErrors: {            // errores por campo
      //       email: ["El email es inválido"],
      //       dateOfBirth: ["La fecha no puede ser futura"]
      //     }
      //   }
      // Es el formato que consumen librerías de formularios (react-hook-form, etc.)
      return res.status(400).json({
        message: 'Datos inválidos',
        errors: result.error.flatten(),
      });
    }

    // ── REASIGNACIÓN CRÍTICA ──────────────────────────────────────────
    // Reemplaza req[source] con result.data (el dato PARSEADO).
    // Esto es importante porque Zod puede:
    //   - Aplicar transforms (ej: z.string().transform(s => s.trim()))
    //   - Aplicar defaults (ej: z.string().default('PROGRAMADA'))
    //   - Convertir tipos (ej: z.coerce.number() → "42" → 42)
    //   - Omitir campos opcionales ausentes
    //
    // Si no se reasignara, el handler recibiría el dato crudo del request
    // (strings para query/params, sin transforms aplicados).
    req[source] = result.data;
    
    // Validación OK → pasar al siguiente middleware / handler.
    next();
  };
}   
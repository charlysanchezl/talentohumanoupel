<?php
/**
 * Adaptador de Reglas Académicas Centralizadas (Single Source of Truth)
 * Lee directamente la configuración declarativa compartida con Node.js.
 */

function getAcademicRules() {
    static $rules = null;
    if ($rules !== null) {
        return $rules;
    }

    $jsonPath = __DIR__ . '/../server/config/academic_rules.json';
    if (file_exists($jsonPath)) {
        $content = file_get_contents($jsonPath);
        $rules = json_decode($content, true);
        if ($rules) {
            return $rules;
        }
    }

    // Valores seguros por defecto en caso de aislamiento
    return [
        'semanasPorLapso' => 15,
        'topesHorarios' => [
            'TIEMPO_COMPLETO' => 36,
            'DEDICACION_EXCLUSIVA' => 40,
            'MEDIO_TIEMPO' => 18,
            'TIEMPO_CONVENCIONAL' => 12
        ]
    ];
}

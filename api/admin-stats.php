<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db.php'; 

try {
    // 1. Cuenta Alumnos (Rol 4)
    $resAlumnos = $conn->query("SELECT COUNT(*) as total FROM usuarios WHERE rol_id = 4");
    $totalAlumnos = $resAlumnos->fetch_assoc()['total'];

    // 2. Cuenta Personal/Maestros ACTIVOS
    // Usamos DISTINCT para no contar dos veces al mismo maestro si tiene varias materias
    $resPersonal = $conn->query("SELECT COUNT(DISTINCT maestro_id) as total FROM asignaciones_maestros WHERE ciclo_escolar = '2025-2026'");
    $totalPersonal = $resPersonal->fetch_assoc()['total'];

    // 3. Cuenta Grupos Activos
    $resGrupos = $conn->query("SELECT COUNT(*) as total FROM grupos");
    $totalGrupos = $resGrupos->fetch_assoc()['total'];

    // 4. Agregamos una métrica extra: Orientadores (opcional según tu diseño)
    // Si tienes un rol específico para ellos (ej. rol_id = 3)
    $resOrientadores = $conn->query("SELECT COUNT(*) as total FROM usuarios WHERE rol_id = 3");
    $totalOrientadores = $resOrientadores->fetch_assoc()['total'];

    echo json_encode([
        "alumnos" => (int)$totalAlumnos,
        "personal" => (int)$totalPersonal,
        "grupos" => (int)$totalGrupos,
        "orientadores" => (int)$totalOrientadores
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
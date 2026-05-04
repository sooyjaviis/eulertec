<?php
// 1. Evitar que cualquier error previo ensucie la salida
error_reporting(0); 
ini_set('display_errors', 0);
ob_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 2. Tu conexión (Asegúrate de que el nombre del archivo sea el correcto)
include 'db.php'; 

$alumno_id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($alumno_id === 0) {
    ob_clean(); // Borra cualquier eco o advertencia previa
    echo json_encode(["error" => true, "message" => "ID no proporcionado"]);
    exit;
}

try {
    // Consulta ajustada a tus capturas de BD
$sql = "SELECT 
            m.nombre_materia AS materia, 
            IFNULL(c.parcial_1, 0) as parcial1, 
            IFNULL(c.parcial_2, 0) as parcial2, 
            IFNULL(c.parcial_3, 0) as parcial3, 
            IFNULL(c.promedio_final, 0) as final 
        FROM materias m
        LEFT JOIN calificaciones c ON m.id = c.materia_id AND c.alumno_id = $alumno_id
        WHERE m.id IN (SELECT materia_id FROM asignaciones_maestros)";

    $result = $conn->query($sql);
    $calificaciones = [];
    $suma_promedio_general = 0;

    while($row = $result->fetch_assoc()) {
        $calificaciones[] = $row;
        $suma_promedio_general += floatval($row['final']);
    }

    $total_materias = count($calificaciones);
    $promedio_final_global = $total_materias > 0 ? $suma_promedio_general / $total_materias : 0;

    // 3. Limpiar buffer y enviar SOLO el JSON
    ob_clean(); 
    echo json_encode([
        "promedio_general" => round($promedio_final_global, 1),
        "calificaciones" => $calificaciones
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(["error" => true, "message" => $e->getMessage()]);
}
$conn->close();
?>
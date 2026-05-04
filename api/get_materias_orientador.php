<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
include 'db.php'; 

// Recibimos el ID del orientador (2, 3 o 4 según tus fotos)
$orientador_id = isset($_GET['orientador_id']) ? intval($_GET['orientador_id']) : 0;

if ($orientador_id === 0) {
    echo json_encode(["error" => "ID de orientador no válido"]);
    exit;
}

$sql = "SELECT DISTINCT
            m.id, 
            m.nombre_materia, 
            g.id AS grupo_id,        /* <-- AGREGAMOS ESTO */
            g.nombre_group AS nombre_grupo 
        FROM asignaciones_orientacion ao
        INNER JOIN grupos g ON ao.grupo_id = g.id
        INNER JOIN materias_por_grado mpg ON g.grado_id = mpg.grado_id
        INNER JOIN materias m ON mpg.materia_id = m.id
        WHERE ao.orientador_id = $orientador_id";

$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["error" => $conn->error]);
    exit;
}

$materias = [];
while ($row = $result->fetch_assoc()) {
    $materias[] = $row;
}

// Si Beatriz (ID 2) entra, verá las materias de los grupos 1.1 y 1.2
echo json_encode($materias);
$conn->close();
?>
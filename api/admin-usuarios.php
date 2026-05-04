<?php
// Limpieza total del buffer para evitar espacios en blanco antes del JSON
ob_clean();
error_reporting(0); // Apagamos errores visuales que rompen el JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include 'db.php';

try {
    // 1. Contadores (con IFNULL para evitar errores si la tabla está vacía)
    $alumnos = $conn->query("SELECT COUNT(*) as t FROM usuarios WHERE rol_id NOT IN (1,2,3)")->fetch_assoc();
    $docentes = $conn->query("SELECT COUNT(*) as t FROM usuarios WHERE rol_id IN (2,3)")->fetch_assoc();
    $grupos = $conn->query("SELECT COUNT(*) as t FROM grupos")->fetch_assoc();

    // 2. Lista de usuarios
    $sql = "SELECT id, nombre, apellido_paterno, apellido_materno, usuario, rol_id FROM usuarios";
    $res = $conn->query($sql);
    $usuarios_lista = [];

    while($row = $res->fetch_assoc()) {
        $u_id = $row['id'];
        $row['nombre_grupo'] = '—';
        $row['estado_maestro'] = 'Sin Asignación';

        // Consulta de grupos simplificada
        $q = $conn->query("SELECT g.* FROM asignaciones_maestros am INNER JOIN grupos g ON am.grupo_id = g.id WHERE am.maestro_id = $u_id LIMIT 1");
        
        if ($q && $q->num_rows > 0) {
            $g = $q->fetch_assoc();
            $row['estado_maestro'] = 'Activo';
            $row['nombre_grupo'] = (isset($g['grado']) ? $g['grado'] : 'ID:'.$g['id']);
        }
        $usuarios_lista[] = $row;
    }

    // RESPUESTA FINAL
    echo json_encode([
        "stats" => [
            "alumnos" => (int)$alumnos['t'],
            "personal" => (int)$docentes['t'],
            "grupos" => (int)$grupos['t'],
            "orientadores" => 0
        ],
        "usuarios" => $usuarios_lista
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(["error" => true, "message" => "Error de conexión"]);
}
?>
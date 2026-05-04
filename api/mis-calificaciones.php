<?php
include 'db.php';

if (isset($_GET['userId'])) {
    $userId = intval($_GET['userId']);

    $sql = "SELECT 
                m.nombre_materia, 
                IFNULL(c.parcial_1, 0) as parcial_1, 
                IFNULL(c.parcial_2, 0) as parcial_2, 
                IFNULL(c.parcial_3, 0) as parcial_3,
                IFNULL(c.promedio_final, 0) as promedio_final
            FROM materias m
            LEFT JOIN calificaciones c ON m.id = c.materia_id AND c.alumno_id = ?
            ORDER BY m.nombre_materia ASC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode($data);
}
?>
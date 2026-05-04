<?php
require('fpdf186/fpdf.php'); // Asegúrate de tener la librería fpdf
include 'db.php';

$alumno_id = $_GET['id'];

// Obtener datos del alumno
$query_alumno = $conn->query("SELECT nombre FROM usuarios WHERE id = $alumno_id");
$alumno = $query_alumno->fetch_assoc();

// Obtener calificaciones
$sql = "SELECT m.nombre_materia, c.parcial_1, c.parcial_2, c.parcial_3, c.promedio_final 
        FROM materias m
        LEFT JOIN calificaciones c ON m.id = c.materia_id AND c.alumno_id = $alumno_id";
$result = $conn->query($sql);

$pdf = new FPDF();
$pdf->AddPage();
$pdf->SetFont('Arial', 'B', 16);
$pdf->Cell(0, 10, 'BOLETA DE CALIFICACIONES - 2026', 0, 1, 'C');
$pdf->Ln(10);

$pdf->SetFont('Arial', '', 12);
$pdf->Cell(0, 10, 'Alumno: ' . utf8_decode($alumno['nombre']), 0, 1);
$pdf->Ln(5);

// Encabezados de tabla
$pdf->SetFillColor(232, 232, 232);
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(60, 10, 'MATERIA', 1, 0, 'C', true);
$pdf->Cell(25, 10, 'P1', 1, 0, 'C', true);
$pdf->Cell(25, 10, 'P2', 1, 0, 'C', true);
$pdf->Cell(25, 10, 'P3', 1, 0, 'C', true);
$pdf->Cell(30, 10, 'FINAL', 1, 1, 'C', true);

$pdf->SetFont('Arial', '', 10);
while($row = $result->fetch_assoc()) {
    $pdf->Cell(60, 10, utf8_decode($row['nombre_materia']), 1);
    $pdf->Cell(25, 10, $row['parcial_1'], 1, 0, 'C');
    $pdf->Cell(25, 10, $row['parcial_2'], 1, 0, 'C');
    $pdf->Cell(25, 10, $row['parcial_3'], 1, 0, 'C');
    $pdf->Cell(30, 10, $row['promedio_final'], 1, 1, 'C');
}

$pdf->Output('D', 'Boleta_Alumno_'.$alumno_id.'.pdf');
?>
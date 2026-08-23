/**
 * @archivo app/academico.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { useDemoRole } from "@/lib/demo-role-context";
import { academicAverage, academicItemsByType, subjectGrades, type AcademicItem, type SubjectGrade } from "@/lib/student-academic-demo";

type AcademicView = "grades" | "evaluations" | "practicals";

/**
 * Implementa la operación AcademicScreen dentro de este módulo.
 */
export default function AcademicScreen() {
  const router = useRouter();
  const { role } = useDemoRole();
  const [view, setView] = useState<AcademicView>("grades");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const average = academicAverage(subjectGrades);
  const evaluations = academicItemsByType("evaluation");
  const practicals = academicItemsByType("practical_work");
  const visibleGrades = selectedSubject ? subjectGrades.filter((grade) => grade.subject === selectedSubject) : subjectGrades;
  const visibleEvaluations = selectedSubject ? evaluations.filter((item) => item.subject === selectedSubject) : evaluations;
  const visiblePracticals = selectedSubject ? practicals.filter((item) => item.subject === selectedSubject) : practicals;
  const subjects = useMemo(() => ["Todas", ...subjectGrades.map((grade) => grade.subject)], []);

  if (role !== "alumno") {
    return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><View style={styles.restricted}><MaterialIcons name="school" size={35} color={brand.navyMid} /><Text style={styles.restrictedTitle}>Seguimiento académico</Text><Text style={styles.restrictedText}>Esta vista está disponible para el perfil alumno.</Text><Pressable onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Volver</Text></Pressable></View></ScreenContainer>;
  }

  const header = <AcademicHeader average={average} view={view} onBack={() => router.back()} onChangeView={setView} subjects={subjects} selectedSubject={selectedSubject} onSelectSubject={(subject) => setSelectedSubject(subject === "Todas" ? null : subject)} />;

  if (view === "grades") {
    return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><FlatList contentContainerStyle={styles.content} data={visibleGrades} keyExtractor={(item) => item.id} ListHeaderComponent={header} renderItem={({ item }) => <GradeRow item={item} />} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} showsVerticalScrollIndicator={false} /></ScreenContainer>;
  }

  const items = view === "evaluations" ? visibleEvaluations : visiblePracticals;
  return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><FlatList contentContainerStyle={styles.content} data={items} keyExtractor={(item) => item.id} ListHeaderComponent={header} renderItem={({ item }) => <AcademicItemRow item={item} onPress={() => router.push(`/academico-detalle?id=${item.id}` as Href)} />} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} showsVerticalScrollIndicator={false} /></ScreenContainer>;
}

/**
 * Implementa la operación AcademicHeader dentro de este módulo.
 */
function AcademicHeader({ average, view, onBack, onChangeView, subjects, selectedSubject, onSelectSubject }: { average: number; view: AcademicView; onBack: () => void; onChangeView: (view: AcademicView) => void; subjects: string[]; selectedSubject: string | null; onSelectSubject: (subject: string) => void }) {
  const views: Array<{ id: AcademicView; label: string }> = [{ id: "grades", label: "Notas" }, { id: "evaluations", label: "Evaluaciones" }, { id: "practicals", label: "Trabajos" }];
  return <View style={styles.headerStack}><View style={styles.topBar}><Pressable accessibilityLabel="Volver" onPress={onBack} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={brand.navy} /></Pressable><Text style={styles.headerTitle}>Mi cursada</Text><View style={styles.topSpacer} /></View><View style={styles.summaryCard}><View><Text style={styles.summaryEyebrow}>PROMEDIO GENERAL</Text><Text style={styles.summaryAverage}>{average.toFixed(1)}</Text><Text style={styles.summaryCaption}>2 materias con calificación publicada</Text></View><View style={styles.summaryIcon}><MaterialIcons name="auto-graph" size={31} color={brand.yellow} /></View></View><View style={styles.viewSwitch}>{views.map((item) => <Pressable key={item.id} onPress={() => onChangeView(item.id)} style={({ pressed }) => [styles.viewOption, view === item.id && styles.viewOptionActive, pressed && styles.pressed]}><Text style={[styles.viewText, view === item.id && styles.viewTextActive]}>{item.label}</Text></Pressable>)}</View><FlatList horizontal showsHorizontalScrollIndicator={false} data={subjects} keyExtractor={(item) => item} contentContainerStyle={styles.subjectFilters} renderItem={({ item }) => { const active = item === "Todas" ? selectedSubject === null : selectedSubject === item; return <Pressable onPress={() => onSelectSubject(item)} style={({ pressed }) => [styles.subjectFilter, active && styles.subjectFilterActive, pressed && styles.pressed]}><Text style={[styles.subjectFilterText, active && styles.subjectFilterTextActive]}>{item}</Text></Pressable>; }} /><Text style={styles.sectionTitle}>{view === "grades" ? "Calificaciones por materia" : view === "evaluations" ? "Evaluaciones" : "Trabajos prácticos"}</Text></View>;
}

/**
 * Implementa la operación GradeRow dentro de este módulo.
 */
function GradeRow({ item }: { item: SubjectGrade }) {
  return <View style={styles.gradeCard}><View style={styles.gradeIcon}><MaterialIcons name="menu-book" size={22} color={brand.navyMid} /></View><View style={styles.itemCopy}><Text style={styles.itemTitle}>{item.subject}</Text><Text style={styles.itemDetail}>{item.detail}</Text></View>{item.grade === null ? <View style={styles.pendingChip}><Text style={styles.pendingText}>Pendiente</Text></View> : <View style={styles.gradeBox}><Text style={styles.gradeNumber}>{item.grade}</Text><Text style={styles.gradeScale}>{item.scale}</Text></View>}</View>;
}

/**
 * Implementa la operación AcademicItemRow dentro de este módulo.
 */
function AcademicItemRow({ item, onPress }: { item: AcademicItem; onPress: () => void }) {
  const isGraded = item.status === "graded";
  const isPending = item.status === "pending_submission";
  const color = isGraded ? brand.green : isPending ? "#AF7600" : item.status === "submitted" ? brand.navyMid : brand.muted;
  const background = isGraded ? "#EAF6F1" : isPending ? "#FFF6D7" : item.status === "submitted" ? brand.ice : "#F2F4F7";
  const label = isGraded ? `Nota ${item.grade}` : isPending ? "Pendiente" : item.status === "submitted" ? "Entregado" : "Programada";
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.academicItem, pressed && styles.pressed]}><View style={[styles.itemIcon, { backgroundColor: background }]}><MaterialIcons name={item.type === "evaluation" ? "assignment" : "folder-open"} size={21} color={color} /></View><View style={styles.itemCopy}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.itemDetail}>{item.subject} · {item.dateLabel}</Text>{item.dueLabel && <Text style={[styles.dueLabel, { color }]}>{item.dueLabel}</Text>}</View><View style={[styles.itemChip, { backgroundColor: background }]}><Text style={[styles.itemChipText, { color }]}>{label}</Text></View></Pressable>;
}

const styles = StyleSheet.create({
  content: { gap: 10, padding: 20, paddingBottom: 34 },
  headerStack: { gap: 15, marginBottom: 4 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  backButton: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  headerTitle: { color: brand.navy, fontSize: 19, fontWeight: "700" },
  topSpacer: { width: 36 },
  summaryCard: { alignItems: "center", backgroundColor: brand.navy, borderRadius: 20, flexDirection: "row", justifyContent: "space-between", padding: 20 },
  summaryEyebrow: { color: "#B8C8DB", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  summaryAverage: { color: brand.white, fontSize: 35, fontWeight: "800", letterSpacing: -1, marginTop: 5 },
  summaryCaption: { color: "#D1DCE9", fontSize: 11, lineHeight: 16, marginTop: 2 },
  summaryIcon: { alignItems: "center", backgroundColor: "#21446F", borderRadius: 31, height: 62, justifyContent: "center", width: 62 },
  viewSwitch: { alignSelf: "stretch", backgroundColor: brand.ice, borderColor: brand.silver, borderRadius: 12, borderWidth: 1, flexDirection: "row", padding: 3 },
  viewOption: { alignItems: "center", borderRadius: 9, flex: 1, justifyContent: "center", minHeight: 35 },
  viewOptionActive: { backgroundColor: brand.white, shadowColor: brand.navy, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  viewText: { color: brand.muted, fontSize: 11, fontWeight: "700" },
  viewTextActive: { color: brand.navy },
  subjectFilters: { gap: 8 },
  subjectFilter: { borderColor: brand.silver, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  subjectFilterActive: { backgroundColor: brand.navy, borderColor: brand.navy },
  subjectFilterText: { color: brand.muted, fontSize: 11, fontWeight: "700" },
  subjectFilterTextActive: { color: brand.white },
  sectionTitle: { color: brand.navy, fontSize: 16, fontWeight: "700" },
  gradeCard: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 77, padding: 13 },
  gradeIcon: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 11, height: 43, justifyContent: "center", width: 43 },
  itemCopy: { flex: 1 },
  itemTitle: { color: brand.text, fontSize: 13, fontWeight: "700", lineHeight: 18 },
  itemDetail: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  gradeBox: { alignItems: "center", backgroundColor: "#EAF6F1", borderRadius: 11, minWidth: 48, paddingHorizontal: 8, paddingVertical: 7 },
  gradeNumber: { color: brand.green, fontSize: 19, fontWeight: "800" },
  gradeScale: { color: brand.green, fontSize: 9, fontWeight: "700", marginTop: 1 },
  pendingChip: { backgroundColor: "#F2F4F7", borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6 },
  pendingText: { color: brand.muted, fontSize: 10, fontWeight: "800" },
  academicItem: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 11, padding: 13 },
  itemIcon: { alignItems: "center", borderRadius: 11, height: 43, justifyContent: "center", width: 43 },
  dueLabel: { fontSize: 10, fontWeight: "800", marginTop: 5 },
  itemChip: { borderRadius: 9, maxWidth: 73, paddingHorizontal: 7, paddingVertical: 5 },
  itemChipText: { fontSize: 10, fontWeight: "800", textAlign: "center" },
  restricted: { alignItems: "center", flex: 1, gap: 10, justifyContent: "center", padding: 28 },
  restrictedTitle: { color: brand.navy, fontSize: 19, fontWeight: "700" },
  restrictedText: { color: brand.muted, fontSize: 13, textAlign: "center" },
  secondaryButton: { borderColor: brand.silver, borderRadius: 12, borderWidth: 1, marginTop: 8, paddingHorizontal: 18, paddingVertical: 11 },
  secondaryText: { color: brand.navy, fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});


import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  applyButton: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 8,
    marginTop: 22,
    padding: 13
  },
  applyButtonText: { color: "white", fontWeight: "700" },
  center: { alignItems: "center", flex: 1, gap: 12, justifyContent: "center" },
  chip: {
    backgroundColor: "#ccfbf1",
    borderRadius: 20,
    color: "#115e59",
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  chips: { alignItems: "center", flexDirection: "row", gap: 10, marginVertical: 10 },
  container: { flex: 1, paddingHorizontal: 16 },
  error: { color: "#b91c1c" },
  filterButton: {
    borderColor: "#0f766e",
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 12
  },
  footer: { alignItems: "center", padding: 20 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16
  },
  image: { backgroundColor: "#e2e8f0", borderRadius: 8, height: 54, width: 54 },
  label: { fontWeight: "700", marginBottom: 7, marginTop: 16 },
  link: { color: "#0f766e", fontWeight: "700" },
  loadButton: {
    borderColor: "#0f766e",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  lowStock: { color: "#b91c1c" },
  muted: { color: "#64748b", marginTop: 3 },
  name: { color: "#0f172a", fontWeight: "700" },
  option: {
    borderColor: "#cbd5e1",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  price: { color: "#0f766e", fontWeight: "600", marginTop: 3 },
  row: {
    alignItems: "center",
    borderBottomColor: "#e2e8f0",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 76,
    paddingVertical: 10
  },
  rowBody: { flex: 1 },
  safe: { backgroundColor: "#f8fafc", flex: 1 },
  search: {
    backgroundColor: "white",
    borderColor: "#cbd5e1",
    borderRadius: 9,
    borderWidth: 1,
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 12
  },
  searchLine: { flexDirection: "row", gap: 8 },
  selectedOption: { backgroundColor: "#ccfbf1", borderColor: "#0f766e" },
  shade: { backgroundColor: "#0008", flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: "80%",
    padding: 20
  },
  sheetTitle: { fontSize: 21, fontWeight: "700" },
  stock: { color: "#166534", fontWeight: "700" },
  title: { color: "#0f172a", fontSize: 27, fontWeight: "700" }
});

import { 
  getAllDepartments, 
  getDepartmentById, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from "../services/departmentService.js";

export const handleGetAllDepartments = async (req, res) => {
  try {
    const departments = await getAllDepartments();
    res.status(200).json({ success: true, departments });
  } catch (error) {
    console.error("Error in handleGetAllDepartments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch departments" });
  }
};

export const handleGetDepartmentById = async (req, res) => {
  const departmentId = req.params.departmentId;
  
  try {
    const department = await getDepartmentById(departmentId);
    res.status(200).json({ success: true, department });
  } catch (error) {
    console.error("Error in handleGetDepartmentById:", error);
    res.status(500).json({ success: false, message: "Failed to fetch department" });
  }
};

export const handleCreateDepartment = async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: "Department name is required" });
  }

  try {
    const department = await createDepartment({ name, description });
    res.status(201).json({ success: true, department });
  } catch (error) {
    console.error("Error in handleCreateDepartment:", error);
    res.status(500).json({ success: false, message: "Failed to create department" });
  }
};

export const handleUpdateDepartment = async (req, res) => {
  const departmentId = req.params.departmentId;
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: "Department name is required" });
  }

  try {
    const result = await updateDepartment(departmentId, { name, description });
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in handleUpdateDepartment:", error);
    res.status(500).json({ success: false, message: "Failed to update department" });
  }
};

export const handleDeleteDepartment = async (req, res) => {
  const departmentId = req.params.departmentId;

  try {
    const result = await deleteDepartment(departmentId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in handleDeleteDepartment:", error);
    res.status(500).json({ success: false, message: "Failed to delete department" });
  }
}; 
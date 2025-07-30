import db from "../config/db.js";

export async function getAllDepartments() {
  try {
    const [departments] = await db.query(
      "SELECT id, name, description FROM departments ORDER BY name ASC"
    );
    
    return departments;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw new Error("Failed to fetch departments");
  }
}

export async function getDepartmentById(departmentId) {
  try {
    const [departments] = await db.query(
      "SELECT id, name, description FROM departments WHERE id = ?",
      [departmentId]
    );
    
    if (departments.length === 0) {
      throw new Error("Department not found");
    }
    
    return departments[0];
  } catch (error) {
    console.error("Error fetching department:", error);
    throw error;
  }
}

export async function createDepartment(departmentData) {
  try {
    const { name, description } = departmentData;
    
    const [result] = await db.query(
      "INSERT INTO departments (name, description) VALUES (?, ?)",
      [name, description]
    );
    
    return {
      id: result.insertId,
      name,
      description
    };
  } catch (error) {
    console.error("Error creating department:", error);
    throw new Error("Failed to create department");
  }
}

export async function updateDepartment(departmentId, departmentData) {
  try {
    const { name, description } = departmentData;
    
    const [result] = await db.query(
      "UPDATE departments SET name = ?, description = ? WHERE id = ?",
      [name, description, departmentId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Department not found");
    }
    
    return { success: true, message: "Department updated successfully" };
  } catch (error) {
    console.error("Error updating department:", error);
    throw error;
  }
}

export async function deleteDepartment(departmentId) {
  try {
    const [result] = await db.query(
      "DELETE FROM departments WHERE id = ?",
      [departmentId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Department not found");
    }
    
    return { success: true, message: "Department deleted successfully" };
  } catch (error) {
    console.error("Error deleting department:", error);
    throw error;
  }
} 
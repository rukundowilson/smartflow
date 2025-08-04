"use client"
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Shield, 
  Settings, 
  Users, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import systemService, { System } from '@/app/services/systemService';

interface CreateSystemData {
  name: string;
  description: string;
  createDefaultRoles?: boolean;
}

interface EditSystemData {
  name: string;
  description: string;
}

const SystemManagement: React.FC = () => {
  const [systems, setSystems] = useState<System[]>([]);
  const [filteredSystems, setFilteredSystems] = useState<System[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateSystemData>({
    name: '',
    description: '',
    createDefaultRoles: true
  });

  const [editForm, setEditForm] = useState<EditSystemData>({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchSystems();
  }, []);

  useEffect(() => {
    const filtered = systems.filter(system => 
      system.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      system.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSystems(filtered);
  }, [systems, searchTerm]);

  const fetchSystems = async () => {
    try {
      setIsLoading(true);
      const response = await systemService.getAllSystems();
      if (response.success) {
        setSystems(response.systems);
      }
    } catch (error) {
      console.error('Error fetching systems:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.name.trim() || !createForm.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await systemService.createSystem(createForm);
      
      if (response.success) {
        alert('System created successfully!');
        setCreateForm({ name: '', description: '', createDefaultRoles: true });
        setShowCreateModal(false);
        fetchSystems();
      }
    } catch (error) {
      console.error('Error creating system:', error);
      alert('Failed to create system. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSystem || !editForm.name.trim() || !editForm.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await systemService.updateSystem(selectedSystem.id, editForm);
      
      if (response.success) {
        alert('System updated successfully!');
        setEditForm({ name: '', description: '' });
        setShowEditModal(false);
        setSelectedSystem(null);
        fetchSystems();
      }
    } catch (error) {
      console.error('Error updating system:', error);
      alert('Failed to update system. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSystem = async () => {
    if (!selectedSystem) return;

    setIsSubmitting(true);
    try {
      const response = await systemService.deleteSystem(selectedSystem.id);
      
      if (response.success) {
        alert('System deleted successfully!');
        setShowDeleteModal(false);
        setSelectedSystem(null);
        fetchSystems();
      }
    } catch (error) {
      console.error('Error deleting system:', error);
      alert('Failed to delete system. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (system: System) => {
    setSelectedSystem(system);
    setEditForm({
      name: system.name,
      description: system.description
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (system: System) => {
    setSelectedSystem(system);
    setShowDeleteModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">System Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage systems and their configurations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create System
        </button>
      </div>

      {/* Search and Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search systems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full"
            />
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Total Systems: {systems.length}</span>
            <span>Showing: {filteredSystems.length}</span>
          </div>
        </div>
      </div>

      {/* Systems List */}
      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSystems.map((system) => (
                  <tr key={system.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{system.name}</div>
                          <div className="text-xs text-gray-500">ID: {system.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{system.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(system.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => openEditModal(system)}
                          className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                          title="Edit System"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(system)}
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                          title="Delete System"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4">
          {filteredSystems.map((system) => (
            <div 
              key={system.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{system.name}</h3>
                      <p className="text-sm text-gray-500">ID: {system.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => openEditModal(system)}
                      className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => openDeleteModal(system)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-sm text-gray-600">{system.description}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Created: {formatDate(system.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSystems.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No systems found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No systems match your search criteria.' : 'Get started by creating your first system.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First System
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create System Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create New System</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSystem} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  System Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter system name"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  placeholder="Enter system description"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="createDefaultRoles"
                  checked={createForm.createDefaultRoles}
                  onChange={(e) => setCreateForm({ ...createForm, createDefaultRoles: e.target.checked })}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="createDefaultRoles" className="ml-2 text-sm text-gray-700">
                  Create default roles for this system
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Create System
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit System Modal */}
      {showEditModal && selectedSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit System</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSystem} className="p-6 space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700 mb-1">
                  System Name *
                </label>
                <input
                  type="text"
                  id="editName"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter system name"
                  required
                />
              </div>

              <div>
                <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  id="editDescription"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  placeholder="Enter system description"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Edit className="h-4 w-4 mr-2" />
                  )}
                  Update System
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete System Modal */}
      {showDeleteModal && selectedSystem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Delete System</h2>
              <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-gray-900">Are you sure?</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                You are about to delete the system <strong>"{selectedSystem.name}"</strong>. 
                This action cannot be undone and will remove all associated data.
              </p>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSystem}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete System
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemManagement; 
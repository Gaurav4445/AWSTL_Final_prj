import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle, Trash2, Edit2, Calendar, IndianRupee, Zap, ClipboardList } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { taskAPI, propertyAPI } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const CATEGORIES = ['AC/Cooling','Water Systems','Electrical','Plumbing','Pest Control','General','Cleaning','Safety','Generator/Inverter','Gas/LPG','RO/Water Purifier','Security'];
const FREQUENCIES = ['Monthly','Quarterly','Bi-Annual','Annual','As-Needed'];
const EMPTY_FORM = { propertyId:'', name:'', description:'', category:'General', frequency:'Quarterly', estimatedCost:'', nextDueDate:'', priority:'Medium' };

const priorityColors = { High:'bg-red-100 text-red-700', Medium:'bg-yellow-100 text-yellow-700', Low:'bg-green-100 text-green-700' };

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [properties, setProperties] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [filterProp, setFilterProp] = useState('all');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [tasksRes, propsRes, tmplRes] = await Promise.all([taskAPI.getAll(), propertyAPI.getAll(), taskAPI.getTemplates()]);
      setTasks(tasksRes.data.data);
      setProperties(propsRes.data.data);
      setTemplates(tmplRes.data.data);
    } catch { setError('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!formData.propertyId) { setError('Please select a property'); return; }
    try {
      if (editingTask) await taskAPI.update(editingTask._id, formData);
      else await taskAPI.create(formData);
      fetchAll(); resetForm();
    } catch (err) { setError(err.response?.data?.error || 'Failed to save task'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try { await taskAPI.delete(id); fetchAll(); }
    catch { setError('Failed to delete task'); }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({ propertyId:task.propertyId?._id||task.propertyId, name:task.name, description:task.description||'', category:task.category, frequency:task.frequency, estimatedCost:task.estimatedCost||'', nextDueDate:task.nextDueDate ? task.nextDueDate.slice(0,10) : '', priority:task.priority||'Medium' });
    setShowForm(true); setShowTemplates(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const useTemplate = (tpl) => {
    setFormData({ ...formData, name:tpl.name, description:tpl.description, category:tpl.category, frequency:tpl.frequency, estimatedCost:tpl.estimatedCost });
    setShowTemplates(false); setShowForm(true);
  };

  const resetForm = () => { setFormData(EMPTY_FORM); setEditingTask(null); setShowForm(false); };

  const filtered = filterProp === 'all' ? tasks : tasks.filter(t => (t.propertyId?._id || t.propertyId) === filterProp);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
            <p className="text-gray-500 mt-1 text-sm">Schedule and manage maintenance tasks</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowTemplates(!showTemplates); setShowForm(false); }}
              className="inline-flex items-center gap-2 border border-orange-300 text-orange-600 hover:bg-orange-50 px-4 py-2.5 rounded-xl font-medium text-sm transition">
              <Zap className="w-4 h-4" /> Templates
            </button>
            <button onClick={() => { resetForm(); setShowForm(!showForm); setShowTemplates(false); }}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Templates Panel */}
        {showTemplates && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-1">🇮🇳 Indian Home Maintenance Templates</h2>
            <p className="text-xs text-gray-400 mb-4">Click any template to pre-fill the form</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {templates.map((tpl, i) => (
                <button key={i} onClick={() => useTemplate(tpl)}
                  className="text-left border border-gray-100 hover:border-orange-300 hover:bg-orange-50 rounded-xl p-4 transition group">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-700">{tpl.name}</p>
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">₹{tpl.estimatedCost}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{tpl.category} · {tpl.frequency}</p>
                  <p className="text-xs text-gray-500 mt-1">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-5">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Property *</label>
                <select name="propertyId" value={formData.propertyId} onChange={handleChange} required
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                  <option value="">Select Property</option>
                  {properties.map(p => <option key={p._id} value={p._id}>{p.name} — {p.city}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Task Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. AC Service"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Category</label>
                <select name="category" value={formData.category} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Frequency</label>
                <select name="frequency" value={formData.frequency} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                  {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Estimated Cost (₹)</label>
                <input type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} placeholder="500"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white">
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Next Due Date</label>
                <input type="date" name="nextDueDate" value={formData.nextDueDate} onChange={handleChange}
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1.5">Notes</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Optional notes"
                  className="w-full border border-gray-200 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm" />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-medium transition">
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter */}
        {properties.length > 1 && (
          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm text-gray-500 font-medium">Filter:</span>
            <select value={filterProp} onChange={e => setFilterProp(e.target.value)}
              className="border border-gray-200 px-3 py-2 rounded-xl text-sm bg-white focus:ring-2 focus:ring-orange-400">
              <option value="all">All Properties</option>
              {properties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
        )}

        {/* Task List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-40 animate-pulse border border-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tasks yet</p>
            <p className="text-gray-400 text-sm mt-1">Add tasks or use a template above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(task => (
              <div key={task._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-2">
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{task.name}</h3>
                    {task.propertyId?.name && <p className="text-xs text-gray-400 mt-0.5">{task.propertyId.name}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => handleEdit(task)} className="p-1.5 hover:bg-blue-50 rounded-lg transition">
                      <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                    <button onClick={() => handleDelete(task._id)} className="p-1.5 hover:bg-red-50 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>

                {task.description && <p className="text-xs text-gray-500 mb-3">{task.description}</p>}

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg">{task.category}</span>
                  <span className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-lg">{task.frequency}</span>
                  <span className={`text-xs px-2 py-1 rounded-lg font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-3 h-3 text-green-500" />
                    <span className="text-green-600 font-semibold">₹{(task.estimatedCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  {task.nextDueDate && (
                    <div className="flex items-center gap-1 text-orange-600">
                      <Calendar className="w-3 h-3" />
                      {formatDate(task.nextDueDate)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
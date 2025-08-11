import React, { useState, useEffect } from 'react';
import { Calendar, Plus, BarChart3, X } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  vacationStart: string;
  vacationDays: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentYear, setCurrentYear] = useState(2025);
  const [showCurrentMonthModal, setShowCurrentMonthModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    vacationStart: '',
    vacationDays: 14
  });

  // Load initial data
  useEffect(() => {
    const savedEmployees = localStorage.getItem('vacation-employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    } else {
      // Default data
      setEmployees([
        { id: '1', name: 'Иванов И.И.', vacationStart: '2025-06-15', vacationDays: 14 },
        { id: '2', name: 'Петров П.П.', vacationStart: '2025-07-01', vacationDays: 21 },
        { id: '3', name: 'Сидоров С.С.', vacationStart: '2025-08-10', vacationDays: 14 }
      ]);
    }
  }, []);

  // Save employees to localStorage
  useEffect(() => {
    localStorage.setItem('vacation-employees', JSON.stringify(employees));
  }, [employees]);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now().toString();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.vacationStart || !formData.vacationDays) {
      showToast('Заполните все поля', 'error');
      return;
    }

    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: formData.name,
      vacationStart: formData.vacationStart,
      vacationDays: formData.vacationDays
    };

    setEmployees(prev => [...prev, newEmployee]);
    setFormData({ name: '', vacationStart: '', vacationDays: 14 });
    setShowAddEmployeeModal(false);
    showToast('Сотрудник успешно добавлен!', 'success');
  };

  const getCurrentMonthVacations = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return employees.filter(employee => {
      const startDate = new Date(employee.vacationStart);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + employee.vacationDays);
      
      return (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
             (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) ||
             (startDate <= new Date(currentYear, currentMonth, 1) && endDate >= new Date(currentYear, currentMonth + 1, 0));
    });
  };

  const generateMonths = () => {
    const months = [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];
    return months;
  };

  const getVacationPosition = (startDate: string, days: number) => {
    const start = new Date(startDate);
    const startMonth = start.getMonth();
    const startDay = start.getDate();
    
    // Calculate position in percentage for the year
    const dayOfYear = (startMonth * 30) + startDay;
    const left = (dayOfYear / 365) * 100;
    const width = (days / 365) * 100;
    
    return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
  };

  const Button = ({ 
    children, 
    variant = 'primary', 
    onClick, 
    type = 'button',
    className = '',
    ...props 
  }: {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    onClick?: () => void;
    type?: 'button' | 'submit';
    className?: string;
  }) => {
    const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 relative overflow-hidden group";
    
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
      secondary: "bg-white hover:bg-gray-50 text-blue-600 shadow-md hover:shadow-lg border border-gray-200 hover:-translate-y-0.5",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-600 border border-gray-300 hover:text-gray-700"
    };

    return (
      <button
        type={type}
        onClick={onClick}
        className={`${baseClasses} ${variants[variant]} ${className}`}
        {...props}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
        {children}
      </button>
    );
  };

  const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children 
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Calendar size={32} className="animate-pulse" />
                График отпусков
              </h1>
              <p className="text-blue-100 text-lg">Управление отпускными периодами сотрудников</p>
            </div>
            <div className="flex gap-4">
              <Button variant="primary" onClick={() => setShowCurrentMonthModal(true)}>
                <BarChart3 size={16} />
                Текущий месяц
              </Button>
              <Button variant="secondary" onClick={() => setShowAddEmployeeModal(true)}>
                <Plus size={16} />
                Добавить сотрудника
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8 pb-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-900">
              Диаграмма Ганта - План отпусков на {currentYear} год
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="yearSelect" className="font-medium text-gray-700">Год:</label>
              <select
                id="yearSelect"
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>

          {/* Gantt Chart */}
          <div className="space-y-6">
            {/* Timeline Header */}
            <div className="flex bg-gray-50 rounded-lg p-4">
              <div className="w-48 font-medium text-gray-700">Сотрудник</div>
              <div className="flex-1 grid grid-cols-12 gap-1 text-center text-sm text-gray-600">
                {generateMonths().map((month, index) => (
                  <div key={index} className="py-2">{month}</div>
                ))}
              </div>
            </div>

            {/* Employee Rows */}
            {employees.map((employee) => (
              <div key={employee.id} className="flex items-center border-b border-gray-100 last:border-b-0 pb-4">
                <div className="w-48 font-medium text-gray-900">{employee.name}</div>
                <div className="flex-1 relative h-12 bg-gray-50 rounded">
                  <div 
                    className="absolute top-2 bottom-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded text-white text-xs flex items-center justify-center font-medium shadow-lg"
                    style={getVacationPosition(employee.vacationStart, employee.vacationDays)}
                  >
                    {employee.vacationDays} дн.
                  </div>
                </div>
              </div>
            ))}

            {employees.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Нет добавленных сотрудников</p>
                <p className="text-sm">Добавьте сотрудника, чтобы начать планирование отпусков</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Current Month Modal */}
      <Modal
        isOpen={showCurrentMonthModal}
        onClose={() => setShowCurrentMonthModal(false)}
        title="Отпуска в текущем месяце"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
            </h4>
          </div>
          
          {getCurrentMonthVacations().length > 0 ? (
            <div className="space-y-3">
              {getCurrentMonthVacations().map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{employee.name}</span>
                  <span className="text-sm text-gray-600">
                    {new Date(employee.vacationStart).toLocaleDateString('ru-RU')} - {employee.vacationDays} дн.
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">В этом месяце отпусков нет</p>
          )}
        </div>
      </Modal>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        title="Добавить сотрудника"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div>
            <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-2">
              Фамилия И.О.
            </label>
            <input
              type="text"
              id="employeeName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Иванов И.И."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="vacationStart" className="block text-sm font-medium text-gray-700 mb-2">
              Дата начала отпуска
            </label>
            <input
              type="date"
              id="vacationStart"
              value={formData.vacationStart}
              onChange={(e) => setFormData(prev => ({ ...prev, vacationStart: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="vacationDays" className="block text-sm font-medium text-gray-700 mb-2">
              Количество дней
            </label>
            <input
              type="number"
              id="vacationDays"
              value={formData.vacationDays}
              onChange={(e) => setFormData(prev => ({ ...prev, vacationDays: parseInt(e.target.value) }))}
              min="1"
              max="365"
              placeholder="14"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddEmployeeModal(false)}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Добавить
            </Button>
          </div>
        </form>
      </Modal>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-lg shadow-lg text-white font-medium animate-in slide-in-from-right ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

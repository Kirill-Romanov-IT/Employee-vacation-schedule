import React, { useState, useEffect } from 'react';
import { Calendar, Plus, BarChart3, X, Users, Edit } from 'lucide-react';

interface Vacation {
  start: string;
  days: number;
}

interface Employee {
  id: string;
  name: string;
  vacations: Vacation[];
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
  const [showEmployeeListModal, setShowEmployeeListModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    vacationStart: '',
    vacationDays: 14
  });
  const [editingVacations, setEditingVacations] = useState<Vacation[]>([]);
  const [editingVacationIndex, setEditingVacationIndex] = useState<number | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadVacationData = async () => {
      // Сначала проверяем localStorage - он имеет приоритет
      const savedEmployees = localStorage.getItem('vacation-employees');
      if (savedEmployees) {
        try {
          const parsedEmployees = JSON.parse(savedEmployees);
          setEmployees(parsedEmployees);
          setDataLoaded(true);
          return; // Если есть данные в localStorage, используем их
        } catch (error) {
          console.error('Error parsing localStorage data:', error);
          localStorage.removeItem('vacation-employees'); // Удаляем поврежденные данные
        }
      }

      // Если нет данных в localStorage, загружаем из JSON файла (только первый раз)
      try {
        const response = await fetch('/vacations.json');
        const vacationData = await response.json();
        
        const formattedEmployees: Employee[] = vacationData.map((emp: any, index: number) => ({
          id: (index + 1).toString(),
          name: emp.name,
          vacations: emp.vacations
        }));
        
        setEmployees(formattedEmployees);
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading vacation data:', error);
        setEmployees([]); // Пустой массив если ничего не загрузилось
        setDataLoaded(true);
      }
    };

    loadVacationData();
  }, []);

  // Save employees to localStorage
  useEffect(() => {
    // Сохраняем только после первоначальной загрузки данных
    if (dataLoaded) {
      localStorage.setItem('vacation-employees', JSON.stringify(employees));
    }
  }, [employees, dataLoaded]);

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
      vacations: [{
        start: formData.vacationStart,
        days: formData.vacationDays
      }]
    };

    setEmployees(prev => [...prev, newEmployee]);
    setFormData({ name: '', vacationStart: '', vacationDays: 14 });
    setShowAddEmployeeModal(false);
    showToast('Сотрудник успешно добавлен!', 'success');
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    showToast('Сотрудник удален', 'success');
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditingVacations([...employee.vacations]);
    setFormData({
      name: employee.name,
      vacationStart: '',
      vacationDays: 14
    });
    setShowEditEmployeeModal(true);
  };

  const handleUpdateEmployee = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!formData.name || !editingEmployee) {
      showToast('Заполните имя сотрудника', 'error');
      return;
    }

    const updatedEmployee: Employee = {
      ...editingEmployee,
      name: formData.name,
      vacations: editingVacations
    };

    setEmployees(prev => prev.map(emp => 
      emp.id === editingEmployee.id ? updatedEmployee : emp
    ));
    
    setFormData({ name: '', vacationStart: '', vacationDays: 14 });
    setEditingVacations([]);
    setEditingEmployee(null);
    setShowEditEmployeeModal(false);
    showToast('Данные сотрудника обновлены!', 'success');
  };

  const handleAddVacation = () => {
    if (!formData.vacationStart || !formData.vacationDays) {
      showToast('Заполните дату и количество дней отпуска', 'error');
      return;
    }

    const newVacation: Vacation = {
      start: formData.vacationStart,
      days: formData.vacationDays
    };

    setEditingVacations(prev => [...prev, newVacation]);
    setFormData(prev => ({ ...prev, vacationStart: '', vacationDays: 14 }));
    showToast('Отпуск добавлен', 'success');
  };

  const handleRemoveVacation = (index: number) => {
    setEditingVacations(prev => prev.filter((_, i) => i !== index));
    showToast('Отпуск удален', 'success');
  };

  const handleEditVacation = (index: number) => {
    const vacation = editingVacations[index];
    setFormData(prev => ({
      ...prev,
      vacationStart: vacation.start,
      vacationDays: vacation.days
    }));
    setEditingVacationIndex(index);
  };

  const handleUpdateVacation = () => {
    if (!formData.vacationStart || !formData.vacationDays || editingVacationIndex === null) {
      showToast('Заполните дату и количество дней отпуска', 'error');
      return;
    }

    const updatedVacation: Vacation = {
      start: formData.vacationStart,
      days: formData.vacationDays
    };

    setEditingVacations(prev => prev.map((v, i) => i === editingVacationIndex ? updatedVacation : v));
    setFormData(prev => ({ ...prev, vacationStart: '', vacationDays: 14 }));
    setEditingVacationIndex(null);
    showToast('Отпуск обновлен', 'success');
  };

  const handleCancelEditVacation = () => {
    setFormData(prev => ({ ...prev, vacationStart: '', vacationDays: 14 }));
    setEditingVacationIndex(null);
  };



  const getCurrentMonthVacations = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return employees.filter(employee => {
      return employee.vacations.some(vacation => {
        const startDate = new Date(vacation.start);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + vacation.days);
        
        return (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
               (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) ||
               (startDate <= new Date(currentYear, currentMonth, 1) && endDate >= new Date(currentYear, currentMonth + 1, 0));
      });
    });
  };

  const getNextMonthVacations = () => {
    const currentDate = new Date();
    const nextMonth = (currentDate.getMonth() + 1) % 12;
    const nextYear = nextMonth === 0 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
    
    return employees.filter(employee => {
      return employee.vacations.some(vacation => {
        const startDate = new Date(vacation.start);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + vacation.days);
        
        return (startDate.getMonth() === nextMonth && startDate.getFullYear() === nextYear) ||
               (endDate.getMonth() === nextMonth && endDate.getFullYear() === nextYear) ||
               (startDate <= new Date(nextYear, nextMonth, 1) && endDate >= new Date(nextYear, nextMonth + 1, 0));
      });
    });
  };

  const getCurrentMonthVacationInfo = (employee: Employee) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthVacations = employee.vacations.filter(vacation => {
      const startDate = new Date(vacation.start);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + vacation.days);
      
      return (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
             (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) ||
             (startDate <= new Date(currentYear, currentMonth, 1) && endDate >= new Date(currentYear, currentMonth + 1, 0));
    });

    if (currentMonthVacations.length > 0) {
      const vacation = currentMonthVacations[0]; // Берем первый отпуск в текущем месяце
      return {
        startDate: new Date(vacation.start).toLocaleDateString('ru-RU'),
        days: vacation.days
      };
    }
    
    return null;
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

  const getTotalVacationDays = (vacations: Vacation[]) => {
    return vacations.reduce((total, vacation) => total + vacation.days, 0);
  };

  const getCurrentMonthIndex = () => {
    return new Date().getMonth();
  };

  const isEmployeeOnVacationThisMonth = (employee: Employee) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return employee.vacations.some(vacation => {
      const startDate = new Date(vacation.start);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + vacation.days);
      
      return (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
             (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) ||
             (startDate <= new Date(currentYear, currentMonth, 1) && endDate >= new Date(currentYear, currentMonth + 1, 0));
    });
  };

  const isVacationInCurrentMonth = (vacation: Vacation) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const startDate = new Date(vacation.start);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + vacation.days);
    
    return (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
           (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) ||
           (startDate <= new Date(currentYear, currentMonth, 1) && endDate >= new Date(currentYear, currentMonth + 1, 0));
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
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              <Button variant="primary" onClick={() => setShowEmployeeListModal(true)}>
                <Users size={16} />
                Список сотрудников
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
      <main className="flex min-h-screen">
        {/* Left Panel - Gantt Chart */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8 pb-6 border-b">
                          <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  Диаграмма Ганта - План отпусков на {currentYear} год
                </h2>
                <p className="text-sm text-gray-600">
                  Отпуск в {new Date().toLocaleDateString('ru-RU', { month: 'long' })}е: 
                  <span className="ml-1 font-medium text-orange-600">
                    {getCurrentMonthVacations().length} сотрудник(ов)
                  </span>
                </p>
              </div>
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
              <div className="w-64 font-medium text-gray-700">Сотрудник</div>
              <div className="flex-1 grid grid-cols-12 gap-1 text-center text-sm text-gray-600">
                {generateMonths().map((month, index) => (
                  <div 
                    key={index} 
                    className={`py-2 px-1 rounded transition-all duration-200 ${
                      index === getCurrentMonthIndex() 
                        ? 'bg-blue-500 text-white font-bold shadow-md transform scale-105' 
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    {month}
                    {index === getCurrentMonthIndex() && (
                      <div className="text-xs opacity-90 mt-0.5">текущий</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Rows Container with fixed height and scroll */}
            <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
              {/* Employee Rows */}
              {employees.map((employee) => {
                const isOnVacationThisMonth = isEmployeeOnVacationThisMonth(employee);
                return (
                  <div 
                    key={employee.id} 
                    className={`flex items-center border-b border-gray-100 last:border-b-0 pb-4 transition-all duration-300 ${
                      isOnVacationThisMonth 
                        ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-md rounded-lg p-2 -mx-2' 
                        : ''
                    }`}
                  >
                    <div className={`w-64 font-medium ${isOnVacationThisMonth ? 'text-orange-900' : 'text-gray-900'} relative`}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span>{employee.name}</span>
                          {isOnVacationThisMonth && (
                            <div className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                              В отпуске
                            </div>
                          )}
                        </div>
                        {isOnVacationThisMonth && (() => {
                          const vacationInfo = getCurrentMonthVacationInfo(employee);
                          return vacationInfo ? (
                            <div className="text-xs text-orange-700 mt-1 font-normal">
                              {vacationInfo.startDate} - {vacationInfo.days} дн.
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>
                    <div className={`flex-1 relative h-12 rounded ${isOnVacationThisMonth ? 'bg-orange-50' : 'bg-gray-50'}`}>
                      {/* Current month highlight */}
                      <div 
                        className="absolute top-0 bottom-0 bg-blue-100 border-l-2 border-r-2 border-blue-300 opacity-30"
                        style={{
                          left: `${(getCurrentMonthIndex() / 12) * 100}%`,
                          width: `${100 / 12}%`
                        }}
                      />
                      
                      {employee.vacations.map((vacation, index) => {
                        const isCurrentMonthVacation = isVacationInCurrentMonth(vacation);
                        return (
                          <div 
                            key={index}
                            className={`absolute top-2 bottom-2 rounded text-white text-xs flex items-center justify-center font-medium shadow-lg transition-all duration-300 ${
                              isCurrentMonthVacation
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 animate-pulse ring-2 ring-orange-300 z-10'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                            style={getVacationPosition(vacation.start, vacation.days)}
                            title={`${new Date(vacation.start).toLocaleDateString('ru-RU')} - ${vacation.days} дн.${isCurrentMonthVacation ? ' (Текущий месяц!)' : ''}`}
                          >
                            {vacation.days}
                            {isCurrentMonthVacation && (
                              <span className="ml-1 text-yellow-300">★</span>
                            )}
                          </div>
                        );
                      })}
                      
                      {employee.vacations.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                          Нет отпусков
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {employees.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Нет добавленных сотрудников</p>
                <p className="text-sm">Добавьте сотрудника, чтобы начать планирование отпусков</p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Right Panel - Next Month Info */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 h-screen">
          <div className="sticky top-6 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Следующий месяц
            </h3>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">
                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </h4>
              <p className="text-sm text-blue-700">
                В отпуске: <span className="font-medium">{getNextMonthVacations().length} сотрудник(ов)</span>
              </p>
            </div>

            {getNextMonthVacations().length > 0 ? (
              <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {getNextMonthVacations().map((employee) => (
                  <div key={employee.id} className="p-3 bg-gray-50 rounded-lg border">
                    <div className="font-medium text-gray-900 mb-2">{employee.name}</div>
                    <div className="space-y-1">
                      {employee.vacations
                        .filter(vacation => {
                          const currentDate = new Date();
                          const nextMonth = (currentDate.getMonth() + 1) % 12;
                          const nextYear = nextMonth === 0 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
                          const startDate = new Date(vacation.start);
                          const endDate = new Date(startDate);
                          endDate.setDate(startDate.getDate() + vacation.days);
                          
                          return (startDate.getMonth() === nextMonth && startDate.getFullYear() === nextYear) ||
                                 (endDate.getMonth() === nextMonth && endDate.getFullYear() === nextYear) ||
                                 (startDate <= new Date(nextYear, nextMonth, 1) && endDate >= new Date(nextYear, nextMonth + 1, 0));
                        })
                        .map((vacation, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-white p-2 rounded border-l-2 border-orange-400">
                            <div className="font-medium text-orange-700">
                              {new Date(vacation.start).toLocaleDateString('ru-RU')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {vacation.days} дн.
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">В следующем месяце отпусков нет</p>
                </div>
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
                <div key={employee.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium mb-2">{employee.name}</div>
                  <div className="space-y-1">
                    {employee.vacations
                      .filter(vacation => {
                        const currentDate = new Date();
                        const currentMonth = currentDate.getMonth();
                        const currentYear = currentDate.getFullYear();
                        const startDate = new Date(vacation.start);
                        const endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + vacation.days);
                        
                        return (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
                               (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) ||
                               (startDate <= new Date(currentYear, currentMonth, 1) && endDate >= new Date(currentYear, currentMonth + 1, 0));
                      })
                      .map((vacation, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {new Date(vacation.start).toLocaleDateString('ru-RU')} - {vacation.days} дн.
                        </div>
                      ))}
                  </div>
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

      {/* Employee List Modal */}
      <Modal
        isOpen={showEmployeeListModal}
        onClose={() => setShowEmployeeListModal(false)}
        title="Список сотрудников"
      >
        <div className="space-y-4">
          {employees.length > 0 ? (
            <div className="space-y-3">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2">{employee.name}</h4>
                    <div className="space-y-1">
                      {employee.vacations.length > 0 ? (
                        employee.vacations.map((vacation, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            Отпуск {index + 1}: {new Date(vacation.start).toLocaleDateString('ru-RU')} ({vacation.days} дн.)
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600">Нет запланированных отпусков</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Всего дней: {getTotalVacationDays(employee.vacations)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleEditEmployee(employee)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit size={16} />
                      Редактировать
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={16} />
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Список сотрудников пуст</p>
              <p className="text-sm">Добавьте сотрудников для отображения здесь</p>
            </div>
          )}
          
          {employees.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Всего сотрудников:</span>
                <span className="font-medium">{employees.length}</span>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={showEditEmployeeModal}
        onClose={() => {
          setShowEditEmployeeModal(false);
          setEditingEmployee(null);
          setEditingVacations([]);
          setEditingVacationIndex(null);
          setFormData({ name: '', vacationStart: '', vacationDays: 14 });
        }}
        title="Редактировать сотрудника"
      >
        <div className="space-y-6">
          {/* Employee Name */}
          <div>
            <label htmlFor="editEmployeeName" className="block text-sm font-medium text-gray-700 mb-2">
              Фамилия И.О.
            </label>
            <input
              type="text"
              id="editEmployeeName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Иванов И.И."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Existing Vacations */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Отпуска сотрудника:</h4>
            {editingVacations.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {editingVacations.map((vacation, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${
                    editingVacationIndex === index ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex-1">
                      <span className="text-sm text-gray-900">
                        {new Date(vacation.start).toLocaleDateString('ru-RU')} - {vacation.days} дн.
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleEditVacation(index)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveVacation(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Нет отпусков</p>
            )}
          </div>

          {/* Add/Edit Vacation */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {editingVacationIndex !== null ? 'Редактировать отпуск:' : 'Добавить отпуск:'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label htmlFor="editVacationStart" className="block text-xs font-medium text-gray-600 mb-1">
                  Дата начала
                </label>
                <input
                  type="date"
                  id="editVacationStart"
                  value={formData.vacationStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, vacationStart: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="editVacationDays" className="block text-xs font-medium text-gray-600 mb-1">
                  Количество дней
                </label>
                <input
                  type="number"
                  id="editVacationDays"
                  value={formData.vacationDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, vacationDays: parseInt(e.target.value) }))}
                  min="1"
                  max="365"
                  placeholder="14"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {editingVacationIndex !== null ? (
              <div className="flex gap-2 mt-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleUpdateVacation}
                  className="flex-1"
                >
                  <Edit size={16} />
                  Сохранить изменения
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelEditVacation}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddVacation}
                className="mt-3 w-full"
              >
                <Plus size={16} />
                Добавить отпуск
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowEditEmployeeModal(false);
                setEditingEmployee(null);
                setEditingVacations([]);
                setEditingVacationIndex(null);
                setFormData({ name: '', vacationStart: '', vacationDays: 14 });
              }}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button 
              type="button"
              variant="primary" 
              className="flex-1"
              onClick={() => handleUpdateEmployee()}
            >
              Сохранить изменения
            </Button>
          </div>
        </div>
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

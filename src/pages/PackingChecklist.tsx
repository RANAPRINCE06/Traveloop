import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2, Loader2, Shirt, FileText, MonitorSmartphone, BriefcaseMedical, Package, RefreshCw, CloudSun, ChevronDown } from "lucide-react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trip, PackingItem } from "@/lib/types";

const DEFAULT_CATEGORIES = [
  { name: "Clothes", icon: Shirt },
  { name: "Documents", icon: FileText },
  { name: "Electronics", icon: MonitorSmartphone },
  { name: "Medicine", icon: BriefcaseMedical },
  { name: "Other", icon: Package },
];

export default function PackingChecklist() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Clothes");

  useEffect(() => {
    if (!tripId) return;

    const unsubscribe = onSnapshot(doc(db, "trips", tripId), (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Trip;
        setTrip(data);
      } else {
        setTrip(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tripId]);

  const items = trip?.packingItems || [];
  const updateItems = async (newItems: PackingItem[]) => {
    if (!tripId) return;
    try {
      await updateDoc(doc(db, "trips", tripId), {
        packingItems: newItems
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleItem = (id: string) => {
    const newItems = items.map(item => item.id === id ? { ...item, packed: !item.packed } : item);
    updateItems(newItems);
  };

  const deleteItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newItems = items.filter(item => item.id !== id);
    updateItems(newItems);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: PackingItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      packed: false,
      category: selectedCategory || "Uncategorized"
    };

    updateItems([...items, newItem]);
    setNewItemText("");
    setShowAdd(false);
  };

  const defaultCategories = ["Clothes", "Documents", "Electronics", "Medicine", "Other"];
  const itemCategories = Array.from(new Set(items.map(i => i.category))).filter(Boolean);
  const tripCategories = (trip as any)?.packingCategories || [];
  const activeCategories = Array.from(new Set([...DEFAULT_CATEGORIES.map(c => c.name), ...tripCategories, ...itemCategories]));

  const addCategory = async () => {
    const name = window.prompt("New category name:");
    if (!name) return;
    try {
      const updated = Array.from(new Set([...(trip as any)?.packingCategories || [], name]));
      await updateDoc(doc(db, "trips", tripId!), { packingCategories: updated });
      setSelectedCategory(name);
    } catch (err) {
      console.error(err);
    }
  };

  const resetList = () => {
    const newItems = items.map(item => ({ ...item, packed: false }));
    updateItems(newItems);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full pt-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!trip) {
    return <div className="text-center pt-32">Trip not found</div>;
  }

  // Get unique categories from default AND existing items
  const categoryList = activeCategories;

  const totalItems = items.length;
  const packedItems = items.filter(i => i.packed).length;
  const progressPercentage = totalItems === 0 ? 0 : Math.round((packedItems / totalItems) * 100);

  return (
    <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-24 md:pb-xl flex flex-col gap-lg min-h-screen">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-2">
        <div>
          <div className="flex items-center gap-sm mb-1">
            <Link to={`/trips/${tripId}`} className="text-secondary hover:text-primary transition-colors flex items-center justify-center -ml-1">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Packing Checklist</h1>
          </div>
          <p className="text-secondary font-body-md">Keep track of everything you need for your upcoming trip to <span className="font-medium text-on-surface">{trip.name}</span>.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowAdd(!showAdd)} className="bg-primary text-on-primary px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Item
          </button>
          <button onClick={addCategory} className="bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors">+ Add Category</button>
        </div>
      </header>

      {/* Input Bar */}
      {showAdd && (
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-center gap-3 bg-surface p-2 pl-4 rounded-2xl shadow-sm border border-outline-variant mb-4">
          <div className="flex-1 w-full flex items-center gap-2">
            <Plus className="w-5 h-5 text-outline" />
            <input 
              type="text" 
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-on-surface font-body-md placeholder:text-outline"
              placeholder="Add new item..."
              autoFocus
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-outline-variant pt-2 sm:pt-0 sm:pl-3">
            <div className="relative">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-transparent font-label-md text-on-surface py-2 pl-2 pr-8 outline-none cursor-pointer"
              >
                {categoryList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-outline absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button type="submit" className="bg-primary text-on-primary font-label-md px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors shadow-sm w-full sm:w-auto shrink-0">
              Add Item
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Grid: Category Cards */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
          {categoryList.map(category => {
            const categoryItems = items.filter(i => i.category === category);
            const packedCount = categoryItems.filter(i => i.packed).length;
            const CatIcon = DEFAULT_CATEGORIES.find(c => c.name === category)?.icon || Package;

            return (
              <div key={category} className="bg-surface rounded-3xl p-6 shadow-sm border border-outline-variant flex flex-col min-h-[160px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CatIcon className="w-6 h-6 text-primary" />
                    <h3 className="font-headline-sm text-on-surface font-bold">{category}</h3>
                  </div>
                  <div className="bg-surface-container text-on-surface-variant font-label-sm px-2.5 py-0.5 rounded-full">
                    {packedCount}/{categoryItems.length}
                  </div>
                </div>

                <div className="flex-1">
                  {categoryItems.length === 0 ? (
                    <p className="text-outline italic font-body-md mt-2">No items yet</p>
                  ) : (
                    <ul className="flex flex-col gap-2 mt-2">
                      {categoryItems.map(item => (
                        <li key={item.id} className="flex items-center justify-between group cursor-pointer" onClick={() => toggleItem(item.id)}>
                          <div className="flex items-center gap-3">
                            <button className="focus:outline-none shrink-0">
                              {item.packed ? (
                                <CheckCircle2 className="w-5 h-5 text-primary" />
                              ) : (
                                <Circle className="w-5 h-5 text-outline" />
                              )}
                            </button>
                            <span className={`font-body-md transition-all ${item.packed ? 'text-outline line-through' : 'text-on-surface'}`}>
                              {item.text}
                            </span>
                          </div>
                          <button className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-all p-1" onClick={(e) => deleteItem(e, item.id)}>
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Sidebar: Progress & Weather */}
        <div className="w-full lg:w-[320px] flex flex-col gap-4 shrink-0">
          {/* Progress Card */}
          <div className="bg-surface rounded-3xl p-6 shadow-sm border border-outline-variant">
            <h3 className="font-headline-sm text-on-surface font-bold mb-3">Packing Progress</h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-secondary font-body-sm">{packedItems} of {totalItems} items packed</span>
              <span className="text-primary font-bold text-sm">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2.5 bg-surface-container rounded-full mb-6 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <button 
              onClick={resetList}
              className="w-full flex items-center justify-center gap-2 border border-outline-variant py-2.5 rounded-xl text-secondary hover:text-on-surface hover:bg-surface-container-lowest transition-colors font-label-md"
            >
              <RefreshCw className="w-4 h-4" /> Reset List
            </button>
          </div>

          {/* Weather Card */}
          <div className="bg-surface rounded-3xl p-6 shadow-sm border border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <CloudSun className="w-6 h-6 text-orange-500" />
              <h3 className="font-headline-sm text-on-surface font-bold">Weather</h3>
            </div>
            <p className="text-secondary font-body-sm mb-4 leading-relaxed">
              Expect mild temperatures (15°C - 22°C) with occasional light rain during your stay next week.
            </p>
            <div className="flex flex-col gap-2">
              <span className="bg-surface-container text-secondary text-xs font-medium px-3 py-1.5 rounded-full w-fit">
                Bring layers
              </span>
              <span className="bg-surface-container text-secondary text-xs font-medium px-3 py-1.5 rounded-full w-fit">
                Umbrella recommended
              </span>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

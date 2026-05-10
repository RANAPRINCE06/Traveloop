import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2, Loader2 } from "lucide-react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trip, PackingItem } from "@/lib/types";

export default function PackingChecklist() {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [newItemText, setNewItemText] = useState("");
  const [showAdd, setShowAdd] = useState(false);

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
      category: "Uncategorized" // We could parse or let user select, but grouping all new ones here works
    };
    
    updateItems([...items, newItem]);
    setNewItemText("");
    setShowAdd(false);
  };

  const categories = Array.from(new Set(items.map(i => i.category)));

  if (loading) {
    return <div className="flex justify-center items-center h-full pt-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!trip) {
    return <div className="text-center pt-32">Trip not found</div>;
  }

  return (
    <main className="flex-1 w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-24 md:pb-xl flex flex-col gap-lg">
       <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-md mb-sm">
        <div className="flex items-center gap-sm">
          <Link to={`/trips/${tripId}`} className="text-secondary hover:text-primary hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="font-headline-md text-headline-md text-on-surface">Packing List</h1>
        </div>
        <div className="flex items-center gap-sm">
          {items.length > 0 && (
            <div className="bg-surface-container-low px-4 py-2 rounded-full font-label-md text-label-md text-on-surface border border-outline-variant">
              {items.filter(i => i.packed).length} / {items.length} Packed
            </div>
          )}
          <button 
            onClick={() => setShowAdd(!showAdd)}
            className="bg-primary text-on-primary rounded-full p-2 flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm"
          >
             <Plus className="w-5 h-5"/>
          </button>
        </div>
      </header>

      {showAdd && (
        <form onSubmit={handleAdd} className="flex items-center gap-2 bg-surface-container-low p-3 rounded-xl border border-outline-variant">
           <input 
             type="text" 
             value={newItemText}
             onChange={(e) => setNewItemText(e.target.value)}
             className="flex-1 bg-transparent border-none outline-none text-on-surface"
             placeholder="Add a new item..."
             autoFocus
           />
           <button type="submit" className="font-label-md text-primary hover:text-primary-container">Add</button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="text-center py-xl bg-surface-container-low border border-dashed border-outline-variant rounded-xl text-on-surface-variant font-body-md">
          No items on your packing list yet. Click the + button to add some.
        </div>
      ) : (
        <div className="flex flex-col gap-xl">
          {categories.map((category) => (
            <section key={category} className="flex flex-col gap-sm">
               <h2 className="font-headline-sm text-headline-sm text-secondary border-b border-outline-variant pb-xs">{category}</h2>
               <ul className="flex flex-col">
                 {items.filter(item => item.category === category).map((item) => (
                    <li key={item.id} className="flex items-center justify-between py-xs group hover:bg-surface-container-lowest/50 rounded-lg px-xs -mx-xs transition-colors cursor-pointer" onClick={() => toggleItem(item.id)}>
                      <div className="flex items-center gap-md">
                        <button className="text-primary rounded-full focus:outline-none transition-colors">
                          {item.packed ? (
                             <CheckCircle2 className="w-6 h-6" />
                          ) : (
                             <Circle className="w-6 h-6 text-outline" />
                          )}
                        </button>
                        <span className={`font-body-md text-body-md transition-all ${item.packed ? 'text-outline line-through' : 'text-on-surface'}`}>
                          {item.text}
                        </span>
                      </div>
                      <button className="text-outline hover:text-error opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all p-1" onClick={(e) => deleteItem(e, item.id)}>
                         <Trash2 className="w-[18px] h-[18px]"/>
                      </button>
                    </li>
                 ))}
               </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Search, Star, Plus } from "lucide-react";

export default function ActivitySearch() {
  const { tripId } = useParams();
  const activities = [
    {
      id: "eiffel",
      category: "Sights",
      title: "Eiffel Tower Summit Tour",
      description: "Experience panoramic views of Paris from the iconic summit. Includes skip-the-line elevator access...",
      price: "₹3,600",
      rating: "4.8",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCWWJGWTLuyYlTTGm-WH5OStLPJcrMaukKKMo2y7aXuzJ6euynVvLY_dW1NKPnWjrRNw_uyq68mNjxavwvUSNaL3axMKh3YRe_FfnRM__an68UFC02JcSV1cE-R9QeYc9Lxpg4adUTK53a6YuRDSH4i1xRxrLjJzKEoxLoEBk3qN_39HEAKxwnPX0meNRO7ER5Hk91m29l6YwlD7zW4BxTFIapmeHd0TuId9jPEzyzevkjZqf81MFQbszptSCZnJvtMQ5UHL_byjthN",
    },
    {
      id: "marais",
      category: "Food",
      title: "Le Marais Food Walking Tour",
      description: "Taste your way through Paris's historic Le Marais district. Sample artisanal cheeses, fresh pastries...",
      price: "₹6,800",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBGc9UIJ5DBvA_scPSe7iE3EVf3vKEaKvrY6L3pfYPdUxZ6CizUrI3yx0vrO6v6FrJjgJbUCd5HPtTJ2lT3TFNT2OihragHkg2HlYpDYRJDhjvFDu467QD2b49Nh4G3FSxyQiWOoZSsxxmMrC75iTsDlx6p9GrX1LHV-yNZdTC8ZRLgwjkfjtJu9eJ4WSsIGvb9l60JpA9KZqJwswpVlSKYqBFv1Jei9R2Z1KUoWg1cXjfDDiLSH4q9ahUw1TB8dGUURkCXR1r3HKDl",
    },
    {
      id: "seine",
      category: "Transport & Leisure",
      title: "Seine Evening Cruise",
      description: "Relax on a 1-hour cruise along the Seine River. See the city's illuminated monuments pass by as you...",
      price: "₹1,600",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3mfhUGYQ4eALeeIXyIUHNOqD2imUx4dXPC9_g-L9_VkB45-1UcB8QjyiAIN-jtNw96-vQqhDaVPvwWeinHuh0GOWJFZ0_bRIrpEPxUyLCrrJIy0FebCvXIJNBmhcESB01ctHGu_x54VOJDT0h3GRn5CXSKJJc4bQ3GOZWEHfgMvntwmr4Ft9JqY3QdHV0N_aJnBMGsuDGAJ9DetOZ51HNch98UCrEQOU4Epoqw-hkwNe2xae8bVOWOya-cEjARwoHWn-tinFqEINt",
    },
  ];

  return (
    <main className="flex-grow w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-24 md:pb-0 flex flex-col gap-lg">
      <section className="flex flex-col gap-md">
        <div className="flex items-center gap-sm text-secondary mb-sm">
          <Link to={`/trips/${tripId}`} className="hover:text-primary transition-colors flex items-center justify-center p-xs rounded-full hover:bg-surface-container-low">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-body-md text-body-md">Back to Trip</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Find Activities</h1>

        <div className="relative w-full max-w-2xl mt-sm">
          <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-outline" />
          </div>
          <input
            type="text"
            className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface font-body-md text-body-md rounded-lg pl-[48px] pr-md py-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline shadow-sm"
            placeholder="Search for museums, tours, food..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-sm mt-sm">
          <span className="font-label-md text-label-md text-on-surface-variant mr-sm">Category:</span>
          <button className="bg-primary text-on-primary font-label-md text-label-md px-md py-sm rounded-full transition-colors border border-primary">
            All
          </button>
          <button className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md px-md py-sm rounded-full hover:bg-surface-container transition-colors">
            Food
          </button>
          <button className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md px-md py-sm rounded-full hover:bg-surface-container transition-colors">
            Sights
          </button>
          <button className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md px-md py-sm rounded-full hover:bg-surface-container transition-colors">
            Transport
          </button>
        </div>
      </section>

      <section className="mt-md">
        <div className="flex justify-between items-end mb-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Recommended for you</h2>
          <span className="font-body-sm text-body-sm text-secondary">Showing 24 results</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md md:gap-lg">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col group hover:border-primary/50 transition-colors">
              <div className="h-48 w-full relative bg-surface-container-high overflow-hidden">
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {activity.rating && (
                  <div className="absolute top-sm right-sm bg-surface-container-lowest/90 backdrop-blur-sm rounded-full px-sm py-xs flex items-center gap-xs shadow-sm">
                    <Star className="w-[14px] h-[14px] text-tertiary-container fill-current" />
                    <span className="font-label-md text-label-md text-on-surface">{activity.rating}</span>
                  </div>
                )}
              </div>
              <div className="p-md flex flex-col flex-grow gap-sm">
                <div>
                  <span className={`font-label-md text-label-md px-xs py-unit rounded flex w-max mb-xs ${
                    activity.category === 'Food' ? 'text-tertiary-container bg-tertiary-fixed/30' :
                    activity.category === 'Sights' ? 'text-primary bg-primary-fixed/30' :
                    'text-secondary-fixed-dim bg-on-secondary-fixed/10'
                  }`}>
                    {activity.category}
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1">{activity.title}</h3>
                </div>
                <p className="font-body-sm text-body-sm text-secondary line-clamp-2 mt-xs">{activity.description}</p>
                <div className="mt-auto pt-md flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-secondary">Starting at</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface">{activity.price}</span>
                  </div>
                  <button className="bg-surface-container border border-outline-variant hover:border-primary text-on-surface font-label-md text-label-md px-md py-sm rounded-lg transition-colors flex items-center gap-xs">
                    <Plus className="w-[18px] h-[18px]" />
                    Add to Trip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-lg flex justify-center">
          <button className="bg-surface-container-lowest border border-outline-variant text-primary font-label-md text-label-md px-lg py-sm rounded-lg hover:bg-surface-container-low transition-colors">
            Load More Activities
          </button>
        </div>
      </section>
    </main>
  );
}

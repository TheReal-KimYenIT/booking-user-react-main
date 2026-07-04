import React from 'react';
import { CheckCircle2, Wind, Bath, Tv, Coffee } from 'lucide-react';

export default function RoomAmenities({ amenities }) {
    // Hàm render icon tiện ích linh hoạt
    const renderAmenityIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('lạnh')) return <Wind size={32} color="#dfa974" />;
        if (lowerName.includes('tắm')) return <Bath size={32} color="#dfa974" />;
        if (lowerName.includes('tv') || lowerName.includes('tivi')) return <Tv size={32} color="#dfa974" />;
        if (lowerName.includes('bar') || lowerName.includes('nước')) return <Coffee size={32} color="#dfa974" />;
        return <CheckCircle2 size={32} color="#dfa974" />;
    };

    return (
        <div className="row mt-5">
            <div className="col-lg-12">
                <div className="room__details__more__facilities">
                    <h2>Các tiện ích nổi bật:</h2>
                    <div className="row mt-4">

                        {amenities && amenities.length > 0 ? (
                            amenities.map(amenity => (
                                <div className="col-lg-3 col-md-4 col-6 mb-4" key={amenity.id}>
                                    <div className="room__details__more__facilities__item text-center">
                                        <div className="icon mb-3">
                                            {renderAmenityIcon(amenity.name)}
                                        </div>
                                        <h6>{amenity.name}</h6>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-muted fst-italic">Chưa cập nhật tiện ích cho phòng này.</div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
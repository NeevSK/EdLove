#include "../include/TrubeCore.hpp"
#include <iostream>

namespace trube {

/**
 * Adds a geometry primitive to a specific surface session.
 * This is used for non-fullscreen motifs and ornaments.
 */
void TrubeCore::addPrimitive(const std::string& sessionName,
                             const std::vector<trube::TrubeVertex>& vertices,
                             const std::vector<uint16_t>& indices) 
{
    std::lock_guard<std::mutex> lock(sessionMutex_);
    
    auto it = sessions_.find(sessionName);
    if (it == sessions_.end()) {
        std::cerr << "[TrubeCore] Cannot add primitive: Session not found: " << sessionName << std::endl;
        return;
    }
    
    auto primitive = TrubePrimitive::createFromVertices(device_, queue_, vertices, indices);
    if (primitive) {
        it->second.primitives.push_back(std::move(primitive));
    }
}

} // namespace trube

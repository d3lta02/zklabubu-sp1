#!/bin/bash

# zkLabubuio Game SP1 - Quick Start Script
# This script provides an interactive menu for running the game with minimal logs

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Clear screen and show header
clear
echo -e "${CYAN} ═══════════════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                                                                                        ${NC}"
echo -e "${CYAN}                          ${WHITE}      zkLabubuio Game SP1 CLI ${CYAN}                 ${NC}"
echo -e "${CYAN}                                                                                        ${NC}"
echo -e "${CYAN}                         ${YELLOW}Zero-Knowledge Proof Gaming Experience${CYAN}         ${NC}"
echo -e "${CYAN}                                                                                        ${NC}"
echo -e "${CYAN} ═══════════════════════════════════════════════════════════════════════════════════════${NC}"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to kill processes on specific ports
kill_port() {
    if port_in_use $1; then
        echo -e "${YELLOW}🔄 Cleaning up port $1...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Silent dependency check
check_dependencies() {
    local missing=0
    
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        missing=1
    fi
    
    if ! command_exists npm; then
        echo -e "${RED}❌ npm is not installed${NC}"
        missing=1
    fi
    
    if ! command_exists rustc; then
        echo -e "${RED}❌ Rust is not installed${NC}"
        missing=1
    fi
    
    if ! command_exists wasm-pack; then
        echo -e "${RED}❌ wasm-pack is not installed${NC}"
        missing=1
    fi
    
    if ! command_exists cargo-prove; then
        echo -e "${RED}❌ SP1 toolchain is not installed${NC}"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        echo -e "${RED}Please install missing dependencies first${NC}"
        exit 1
    fi
}

# Clean up ports before starting
cleanup_ports() {
    kill_port 3000
    kill_port 8080
}

# Main menu
show_menu() {
    echo -e "\n${GREEN}🎮 Choose your game mode:${NC}\n"
    echo -e "${WHITE}1)${NC} ${GREEN}🚀 Full Game Experience${NC}"
    echo -e "   Complete zkLabubuio game with real SP1 zero-knowledge proofs"
    echo -e "   ${BLUE}Frontend:${NC} http://localhost:8080 | ${BLUE}Backend:${NC} http://localhost:3000\n"
    
    echo -e "${WHITE}2)${NC} ${YELLOW}🎯 Frontend Only (Demo Mode)${NC}"
    echo -e "   Game frontend with simulated proofs - perfect for demos"
    echo -e "   ${BLUE}Frontend:${NC} http://localhost:8080\n"
    
    echo -e "${WHITE}3)${NC} ${PURPLE}🧪 Test SP1 System${NC}"
    echo -e "   Test SP1 zero-knowledge proof system with sample data\n"
    
    echo -e "${WHITE}4)${NC} ${CYAN}🔬 Generate Real Proof${NC}"
    echo -e "   Generate actual cryptographic proofs for game data\n"
    
    echo -e "${WHITE}5)${NC} ${BLUE}🔧 Setup & Install Dependencies${NC}"
    echo -e "   Install all required dependencies for the project\n"
    
    echo -e "${WHITE}6)${NC} ${RED}❌ Exit${NC}\n"
}

# Start full game experience
start_full_game() {
    echo -e "${GREEN}🚀 Starting Full Game Experience...${NC}"
    echo -e "${BLUE}Frontend:${NC} http://localhost:8080"
    echo -e "${BLUE}Backend:${NC} http://localhost:3000"
    echo -e "${YELLOW}Note: SP1 proof logs will only be shown when you click the Prove button in game${NC}\n"
    
    cleanup_ports
    
    # Start servers with minimal output
    echo -e "${CYAN}Starting servers...${NC}"
    npm run dev >/dev/null 2>&1 &
    
    echo -e "${GREEN}✅ Servers started successfully!${NC}"
    echo -e "${CYAN}🎮 Open your browser to http://localhost:8080 to play the game${NC}"
    echo -e "${YELLOW}💡 SP1 proof details will be shown in the game interface when you generate proofs${NC}"
    
    # Keep script running
    echo -e "\n${BLUE}Press Ctrl+C to stop the servers${NC}"
    wait
}

# Start frontend only
start_frontend_only() {
    echo -e "${YELLOW}🎯 Starting Frontend Only (Demo Mode)...${NC}"
    echo -e "${BLUE}Frontend:${NC} http://localhost:8080"
    echo -e "${YELLOW}Note: This mode uses simulated SP1 proofs for demonstration${NC}\n"
    
    cleanup_ports
    
    echo -e "${CYAN}Starting frontend...${NC}"
    npm run dev:frontend-only >/dev/null 2>&1 &
    
    echo -e "${GREEN}✅ Frontend started successfully!${NC}"
    echo -e "${CYAN}🎮 Open your browser to http://localhost:8080 to play the game${NC}"
    
    # Keep script running
    echo -e "\n${BLUE}Press Ctrl+C to stop the frontend${NC}"
    wait
}

# Test SP1 system
test_sp1_system() {
    echo -e "${PURPLE}🧪 Testing SP1 System...${NC}"
    echo -e "${CYAN}This will show detailed SP1 execution logs${NC}\n"
    
    npm run test:sp1
    
    echo -e "\n${GREEN}✅ SP1 system test completed${NC}"
    echo -e "${BLUE}Press any key to return to menu...${NC}"
    read -n 1
}

# Generate real proof
generate_real_proof() {
    echo -e "${CYAN}🔬 Generating Real SP1 Proof...${NC}"
    echo -e "${CYAN}This will show detailed proof generation logs${NC}\n"
    
    npm run prove:sp1
    
    echo -e "\n${GREEN}✅ Real proof generation completed${NC}"
    echo -e "${BLUE}Press any key to return to menu...${NC}"
    read -n 1
}

# Setup dependencies
setup_dependencies() {
    echo -e "${BLUE}🔧 Setting up dependencies...${NC}\n"
    
    echo -e "${CYAN}Installing backend dependencies...${NC}"
    cd backend && npm install
    
    echo -e "${CYAN}Installing frontend dependencies...${NC}"
    cd ../zklabubu_game/www && npm install
    
    echo -e "${CYAN}Building WASM package...${NC}"
    cd .. && npm run build
    
    cd ..
    
    echo -e "\n${GREEN}✅ All dependencies installed successfully!${NC}"
    echo -e "${BLUE}Press any key to return to menu...${NC}"
    read -n 1
}

# Main execution
main() {
    # Silent dependency check
    check_dependencies
    
    while true; do
        show_menu
        echo -n -e "${WHITE}Please enter your choice (1-6): ${NC}"
        read -n 1 choice
        echo
        
        case $choice in
            1)
                start_full_game
                ;;
            2)
                start_frontend_only
                ;;
            3)
                test_sp1_system
                ;;
            4)
                generate_real_proof
                ;;
            5)
                setup_dependencies
                ;;
            6)
                echo -e "\n${RED}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "\n${RED}❌ Invalid choice. Please select 1-6.${NC}"
                sleep 2
                clear
                ;;
        esac
    done
}

# Run main function
main 
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

# Check basic system requirements
check_basic_dependencies() {
    local missing=0
    
    if ! command_exists node; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        echo -e "${YELLOW}   Please install Node.js from https://nodejs.org${NC}"
        missing=1
    fi
    
    if ! command_exists npm; then
        echo -e "${RED}❌ npm is not installed${NC}"
        echo -e "${YELLOW}   npm should come with Node.js installation${NC}"
        missing=1
    fi
    
    if ! command_exists rustc; then
        echo -e "${RED}❌ Rust is not installed${NC}"
        echo -e "${YELLOW}   Please install Rust from https://rustup.rs${NC}"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        echo -e "\n${RED}Please install the missing basic dependencies first.${NC}"
        echo -e "${CYAN}After installing them, Option 1 will automatically handle the rest!${NC}"
        exit 1
    fi
}

# Check all dependencies (for other options)
check_all_dependencies() {
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
        echo -e "${YELLOW}You can use Option 1 for automatic setup or Option 5 for manual setup${NC}"
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
    # Check server status
    local frontend_status="${RED}❌ Stopped${NC}"
    local backend_status="${RED}❌ Stopped${NC}"
    
    if lsof -i :8080 >/dev/null 2>&1; then
        frontend_status="${GREEN}✅ Running${NC}"
    fi
    
    if lsof -i :3000 >/dev/null 2>&1; then
        backend_status="${GREEN}✅ Running${NC}"
    fi
    
    echo -e "\n${GREEN}🎮 Choose your game mode:${NC}\n"
    echo -e "${WHITE}1)${NC} ${GREEN}🚀 Full Game Experience (Quick Setup)${NC}"
    echo -e "   Complete zkLabubuio game with real SP1 zero-knowledge proofs"
    echo -e "   ${YELLOW}⚡ Auto-installs all dependencies and builds project${NC}"
    echo -e "   ${BLUE}Frontend:${NC} http://localhost:8080 ($frontend_status) | ${BLUE}Backend:${NC} http://localhost:3000 ($backend_status)\n"
    
    echo -e "${WHITE}2)${NC} ${YELLOW}🎯 Frontend Only (Demo Mode)${NC}"
    echo -e "   Game frontend with simulated proofs - perfect for demos"
    echo -e "   ${BLUE}Frontend:${NC} http://localhost:8080 ($frontend_status)\n"
    
    echo -e "${WHITE}3)${NC} ${PURPLE}🧪 Test SP1 System${NC}"
    echo -e "   Test SP1 zero-knowledge proof system with sample data\n"
    
    echo -e "${WHITE}4)${NC} ${CYAN}🔬 Generate Real Proof${NC}"
    echo -e "   Generate actual cryptographic proofs for game data\n"
    
    echo -e "${WHITE}5)${NC} ${BLUE}🔧 Setup & Install Dependencies${NC}"
    echo -e "   Install all required dependencies for the project\n"
    
    echo -e "${WHITE}6)${NC} ${YELLOW}🛑 Stop All Running Servers${NC}"
    echo -e "   Stop any running frontend/backend servers\n"
    
    echo -e "${WHITE}7)${NC} ${RED}❌ Exit${NC}\n"
}

# Start full game experience with quick setup
start_full_game() {
    echo -e "${GREEN}🚀 Starting Full Game Experience (Quick Setup)...${NC}"
    echo -e "${BLUE}Frontend:${NC} http://localhost:8080"
    echo -e "${BLUE}Backend:${NC} http://localhost:3000"
    echo -e "${YELLOW}Note: SP1 proof logs will only be shown when you click the Prove button in game${NC}\n"
    
    cleanup_ports
    
    # Quick Setup: Install all dependencies and build
    echo -e "${CYAN}🔧 Setting up dependencies (this may take a few minutes)...${NC}"
    
    # Install root dependencies
    echo -e "${BLUE}Installing root dependencies...${NC}"
    npm install >/dev/null 2>&1
    
    # Install backend dependencies
    echo -e "${BLUE}Installing backend dependencies...${NC}"
    cd backend && npm install >/dev/null 2>&1
    cd ..
    
    # Install frontend dependencies
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    cd zklabubu_game && npm install >/dev/null 2>&1
    cd www && npm install >/dev/null 2>&1
    cd ../..
    
    # Build WASM package
    echo -e "${BLUE}Building WASM package...${NC}"
    cd zklabubu_game && npm run build >/dev/null 2>&1
    cd ..
    
    # Check and install wasm-pack if needed
    if ! command_exists wasm-pack; then
        echo -e "${YELLOW}Installing wasm-pack...${NC}"
        curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh >/dev/null 2>&1
    fi
    
    # Check if SP1 toolchain is installed
    if ! command_exists cargo-prove; then
        echo -e "${YELLOW}Installing SP1 toolchain (this may take several minutes)...${NC}"
        echo -e "${CYAN}Please wait while SP1 is being installed...${NC}"
        
        # Install SP1 toolchain
        curl -L https://sp1up.succinct.xyz | bash >/dev/null 2>&1
        
        # Source the environment
        if [ -f "$HOME/.sp1/env" ]; then
            source "$HOME/.sp1/env"
        fi
        
        # Update PATH
        export PATH="$HOME/.sp1/bin:$PATH"
        
        # Run sp1up to install the toolchain
        if [ -f "$HOME/.sp1/bin/sp1up" ]; then
            "$HOME/.sp1/bin/sp1up" >/dev/null 2>&1
        fi
        
        # Verify installation
        if command_exists cargo-prove; then
            echo -e "${GREEN}✅ SP1 toolchain installed successfully${NC}"
        else
            echo -e "${YELLOW}⚠️  SP1 installation may need manual completion${NC}"
            echo -e "${CYAN}You can run 'npm run install:sp1' manually after the game starts${NC}"
        fi
    fi
    
    echo -e "${GREEN}✅ Quick setup completed successfully!${NC}"
    echo -e "${CYAN}Starting servers...${NC}"
    
    # Start servers with minimal output
    npm run dev >/dev/null 2>&1 &
    
    # Wait a bit for servers to start
    sleep 3
    
    # Check if servers are running
    if lsof -i :8080 >/dev/null 2>&1 && lsof -i :3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Servers started successfully!${NC}"
        echo -e "${CYAN}🎮 Open your browser to http://localhost:8080 to play the game${NC}"
        echo -e "${YELLOW}💡 SP1 proof details will be shown in the game interface when you generate proofs${NC}"
        
        # Keep script running with better feedback
        echo -e "\n${BLUE}Servers are running successfully!${NC}"
        echo -e "${PURPLE}Choose an option:${NC}"
        echo -e "${WHITE}1)${NC} Return to menu (servers continue running)"
        echo -e "${WHITE}2)${NC} Stop servers and return to menu"
        echo -e "${WHITE}3)${NC} Keep servers running and wait (Press Ctrl+C to stop)"
        echo -e ""
        echo -n -e "${WHITE}Enter your choice (1-3): ${NC}"
        read -n 1 server_choice
        echo
        
        case $server_choice in
            1)
                echo -e "\n${YELLOW}Returning to menu... Servers will continue running in background${NC}"
                echo -e "${CYAN}💡 Frontend: http://localhost:8080 | Backend: http://localhost:3000${NC}"
                sleep 1
                return
                ;;
            2)
                echo -e "\n${YELLOW}Stopping servers...${NC}"
                cleanup_ports
                echo -e "${GREEN}✅ Servers stopped${NC}"
                sleep 1
                return
                ;;
            3)
                echo -e "\n${BLUE}Servers running... Press Ctrl+C to stop them${NC}"
                wait
                ;;
            *)
                echo -e "\n${YELLOW}Invalid choice. Returning to menu... Servers will continue running in background${NC}"
                sleep 1
                return
                ;;
        esac
    else
        echo -e "${RED}❌ Failed to start servers. Please check for errors and try again.${NC}"
        echo -e "${BLUE}Press any key to return to menu...${NC}"
        read -n 1
    fi
}

# Start frontend only
start_frontend_only() {
    echo -e "${YELLOW}🎯 Starting Frontend Only (Demo Mode)...${NC}"
    echo -e "${BLUE}Frontend:${NC} http://localhost:8080"
    echo -e "${YELLOW}Note: This mode uses simulated SP1 proofs for demonstration${NC}\n"
    
    cleanup_ports
    
    echo -e "${CYAN}Starting frontend...${NC}"
    npm run dev:frontend-only >/dev/null 2>&1 &
    
    # Wait a bit for frontend to start
    sleep 3
    
    # Check if frontend is running
    if lsof -i :8080 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend started successfully!${NC}"
        echo -e "${CYAN}🎮 Open your browser to http://localhost:8080 to play the game${NC}"
        
        # Keep script running with better feedback
        echo -e "\n${BLUE}Frontend is running successfully!${NC}"
        echo -e "${PURPLE}Choose an option:${NC}"
        echo -e "${WHITE}1)${NC} Return to menu (frontend continues running)"
        echo -e "${WHITE}2)${NC} Stop frontend and return to menu"
        echo -e "${WHITE}3)${NC} Keep frontend running and wait (Press Ctrl+C to stop)"
        echo -e ""
        echo -n -e "${WHITE}Enter your choice (1-3): ${NC}"
        read -n 1 frontend_choice
        echo
        
        case $frontend_choice in
            1)
                echo -e "\n${YELLOW}Returning to menu... Frontend will continue running in background${NC}"
                echo -e "${CYAN}💡 Frontend: http://localhost:8080${NC}"
                sleep 1
                return
                ;;
            2)
                echo -e "\n${YELLOW}Stopping frontend...${NC}"
                kill_port 8080
                echo -e "${GREEN}✅ Frontend stopped${NC}"
                sleep 1
                return
                ;;
            3)
                echo -e "\n${BLUE}Frontend running... Press Ctrl+C to stop it${NC}"
                wait
                ;;
            *)
                echo -e "\n${YELLOW}Invalid choice. Returning to menu... Frontend will continue running in background${NC}"
                sleep 1
                return
                ;;
        esac
    else
        echo -e "${RED}❌ Failed to start frontend. Please check for errors and try again.${NC}"
        echo -e "${BLUE}Press any key to return to menu...${NC}"
        read -n 1
    fi
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

# Stop all servers
stop_all_servers() {
    echo -e "${YELLOW}🛑 Stopping all running servers...${NC}\n"
    
    local frontend_running=false
    local backend_running=false
    
    if lsof -i :8080 >/dev/null 2>&1; then
        frontend_running=true
        echo -e "${CYAN}Stopping frontend server (port 8080)...${NC}"
        kill_port 8080
    fi
    
    if lsof -i :3000 >/dev/null 2>&1; then
        backend_running=true
        echo -e "${CYAN}Stopping backend server (port 3000)...${NC}"
        kill_port 3000
    fi
    
    if [ "$frontend_running" = true ] || [ "$backend_running" = true ]; then
        echo -e "\n${GREEN}✅ All servers stopped successfully!${NC}"
    else
        echo -e "${BLUE}💡 No servers were running.${NC}"
    fi
    
    echo -e "${BLUE}Press any key to return to menu...${NC}"
    read -n 1
}

# Setup dependencies (manual installation)
setup_dependencies() {
    echo -e "${BLUE}🔧 Setting up dependencies manually...${NC}\n"
    
    # Install root dependencies
    echo -e "${CYAN}Installing root dependencies...${NC}"
    npm install
    
    # Install backend dependencies
    echo -e "${CYAN}Installing backend dependencies...${NC}"
    cd backend && npm install
    cd ..
    
    # Install frontend dependencies
    echo -e "${CYAN}Installing frontend dependencies...${NC}"
    cd zklabubu_game && npm install
    cd www && npm install
    cd ../..
    
    # Build WASM package
    echo -e "${CYAN}Building WASM package...${NC}"
    cd zklabubu_game && npm run build
    cd ..
    
    # Check and install wasm-pack if needed
    if ! command_exists wasm-pack; then
        echo -e "${YELLOW}Installing wasm-pack...${NC}"
        curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
    fi
    
    # Check if SP1 toolchain is installed
    if ! command_exists cargo-prove; then
        echo -e "${YELLOW}Installing SP1 toolchain...${NC}"
        npm run install:sp1
        
        # Source the environment
        if [ -f "$HOME/.sp1/env" ]; then
            source "$HOME/.sp1/env"
        fi
        
        # Update PATH
        export PATH="$HOME/.sp1/bin:$PATH"
        
        echo -e "${GREEN}✅ SP1 toolchain installed${NC}"
    fi
    
    echo -e "\n${GREEN}✅ All dependencies installed successfully!${NC}"
    echo -e "${CYAN}You can now use Option 1 to start the full game experience${NC}"
    echo -e "${BLUE}Press any key to return to menu...${NC}"
    read -n 1
}

# Main execution
main() {
    while true; do
        show_menu
        echo -n -e "${WHITE}Please enter your choice (1-7): ${NC}"
        read -n 1 choice
        echo
        
        case $choice in
            1)
                # Only check basic dependencies for quick setup
                check_basic_dependencies
                start_full_game
                ;;
            2)
                # Check all dependencies for frontend only
                check_all_dependencies
                start_frontend_only
                ;;
            3)
                # Check all dependencies for SP1 testing
                check_all_dependencies
                test_sp1_system
                ;;
            4)
                # Check all dependencies for proof generation
                check_all_dependencies
                generate_real_proof
                ;;
            5)
                # Basic dependencies needed for setup
                check_basic_dependencies
                setup_dependencies
                ;;
            6)
                stop_all_servers
                ;;
            7)
                echo -e "\n${RED}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "\n${RED}❌ Invalid choice. Please select 1-7.${NC}"
                sleep 2
                clear
                ;;
        esac
    done
}

# Run main function
main 
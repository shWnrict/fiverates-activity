// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract EbukmoBooking {
    address payable public owner;
    uint256 public bookingCount;
    uint256 public totalRevenue;

    mapping(uint256 => Booking) public bookings;

    struct Booking {
        address traveler;
        uint256 amount;
        bool paid;
    }

    event BookingCreated(uint256 bookingId, address traveler, uint256 amount);
    event PaymentReceived(uint256 bookingId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can call this function.");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
        bookingCount = 0;
        totalRevenue = 0;
    }

    function createBooking() external payable {
        require(msg.value > 0, "Booking amount must be greater than zero.");

        bookingCount++;
        uint256 bookingId = bookingCount;
        bookings[bookingId] = Booking(msg.sender, msg.value, false);

        emit BookingCreated(bookingId, msg.sender, msg.value);
    }

    function receivePayment(uint256 bookingId) external onlyOwner {
        Booking storage booking = bookings[bookingId];
        require(!booking.paid, "Payment for this booking has already been received.");

        booking.paid = true;
        totalRevenue += booking.amount;

        emit PaymentReceived(bookingId);
    }

    function withdrawFunds() external onlyOwner {
        require(totalRevenue > 0, "No funds available for withdrawal.");

        uint256 amount = totalRevenue;
        totalRevenue = 0;

        (bool success, ) = owner.call{value: amount}("");
        require(success, "Withdrawal failed.");
    }
}

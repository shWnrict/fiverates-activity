const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EbukmoBooking", function () {
  let ebukmoBooking;
  let owner;
  let traveler;

  beforeEach(async function () {
    const EbukmoBooking = await ethers.getContractFactory("EbukmoBooking");
    [owner, traveler] = await ethers.getSigners();

    ebukmoBooking = await EbukmoBooking.deploy();
    await ebukmoBooking.deployed();
  });

  it("should create a booking", async function () {
    const bookingAmount = ethers.utils.parseEther("1.0");
    const bookingTx = await ebukmoBooking.connect(traveler).createBooking({ value: bookingAmount });
    await bookingTx.wait();

    const booking = await ebukmoBooking.bookings(1);

    expect(booking.traveler).to.equal(traveler.address);
    expect(booking.amount).to.equal(bookingAmount);
    expect(booking.paid).to.equal(false);
  });

  it("should receive payment for a booking", async function () {
    const bookingAmount = ethers.utils.parseEther("1.0");
    await ebukmoBooking.connect(traveler).createBooking({ value: bookingAmount });

    const paymentTx = await ebukmoBooking.connect(owner).receivePayment(1);
    await paymentTx.wait();

    const booking = await ebukmoBooking.bookings(1);

    expect(booking.paid).to.equal(true);
  });

  it("should allow the owner to withdraw funds", async function () {
    const bookingAmount = ethers.utils.parseEther("1.0");
    await ebukmoBooking.connect(traveler).createBooking({ value: bookingAmount });

    const paymentTx = await ebukmoBooking.connect(owner).receivePayment(1);
    await paymentTx.wait();

    const initialBalance = await ethers.provider.getBalance(owner.address);

    const withdrawTx = await ebukmoBooking.connect(owner).withdrawFunds();
    await withdrawTx.wait();

    const finalBalance = await ethers.provider.getBalance(owner.address);

    expect(finalBalance).to.be.above(initialBalance);
  });
});
